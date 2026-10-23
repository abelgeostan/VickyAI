import json
import logging
import re
from typing import Any, Dict, List, Optional
from app.config import get_settings
from app.services.search.base import SearchResult
from app.services.search.factory import get_search_provider
from app.services.ollama_service import ollama_service

logger = logging.getLogger("vickyai.search.service")

WEB_SEARCH_TOOL = {
    "type": "function",
    "function": {
        "name": "web_search",
        "description": (
            "Search the live web for current news, recent developments, real-time events, "
            "factual data, or specific information. The query MUST be a standalone, fully contextualized "
            "search query that resolves references from prior messages (e.g., if previous conversation was about "
            "'tech news' and user says 'cybersecurity', search for 'latest cybersecurity tech news' instead of just 'cybersecurity')."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The specific, standalone search query to submit to the search engine.",
                }
            },
            "required": ["query"],
        },
    },
}


class WebSearchService:
    """Service to execute searches, generate LLM-driven tool queries, and format context for LLM generation."""

    def __init__(self):
        self.settings = get_settings()

    def clean_query(self, raw: str, fallback: str) -> str:
        """Cleans and extracts search query from raw text, tool call representations, or JSON."""
        if not raw or not raw.strip():
            return fallback

        text = raw.strip()

        # If it's a function call representation like web_search(query="...")
        fn_match = re.search(
            r'web_search\s*\(\s*(?:query\s*=\s*)?["\'](.*?)["\']\s*\)',
            text,
            re.DOTALL | re.IGNORECASE,
        )
        if fn_match:
            return fn_match.group(1).strip()

        # If it's json like {"query": "..."}
        json_match = re.search(r'["\']query["\']\s*:\s*["\'](.*?)["\']', text)
        if json_match:
            return json_match.group(1).strip()

        # Take first line if multiple lines
        first_line = text.split("\n")[0].strip()

        # Strip markdown bold or headers
        first_line = re.sub(r"^[#*\-•>\s]+", "", first_line)

        # Strip prefixes like "Search query:", "Query:", "Search for:", "Search:"
        first_line = re.sub(
            r"^(?:search\s+query|query|search\s+for|search|web\s+search)\s*:\s*",
            "",
            first_line,
            flags=re.IGNORECASE,
        )
        first_line = re.sub(
            r"^(?:here\s+is\s+(?:the\s+)?search\s+query\s*:\s*)",
            "",
            first_line,
            flags=re.IGNORECASE,
        )

        # Strip enclosing quotes, backticks, asterisks, or hashes
        first_line = first_line.strip('`"\'*# \t').strip()

        if len(first_line) >= 2:
            return first_line

        return fallback

    async def decide_search_query(
        self,
        model: str,
        messages: List[Dict[str, Any]],
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        """
        Uses the LLM to determine the actual web search query via toolcall or contextual query formulation.
        Takes into account the entire conversation history so follow-ups like 'cybersecurity'
        are expanded into 'latest cybersecurity tech news 2026' rather than searching the raw word blindly.
        """
        fallback_query = user_prompt.strip()

        # Strategy 1: Attempt native Ollama tool calling with WEB_SEARCH_TOOL
        try:
            res = await ollama_service.chat(
                model=model,
                messages=messages,
                system_prompt=system_prompt,
                tools=[WEB_SEARCH_TOOL],
            )
            msg = res.get("message", {})
            tool_calls = msg.get("tool_calls", [])

            if tool_calls:
                for tc in tool_calls:
                    fn = tc.get("function", {})
                    if fn.get("name") == "web_search":
                        args = fn.get("arguments", {})
                        if isinstance(args, str):
                            try:
                                args = json.loads(args)
                            except Exception:
                                pass
                        query = args.get("query")
                        if query and isinstance(query, str) and query.strip():
                            cleaned = self.clean_query(query, fallback_query)
                            logger.info(f"Ollama native toolcall produced search query: {cleaned!r}")
                            return cleaned

            # Check if model returned tool call in text content (e.g. JSON or XML)
            content = msg.get("content", "")
            if content:
                extracted = self.clean_query(content, "")
                if extracted and extracted != content and len(extracted) >= 2:
                    logger.info(f"Extracted toolcall query from text content: {extracted!r}")
                    return extracted

        except Exception as e:
            logger.info(f"Native toolcall request returned: {e} - falling back to contextual formulation")

        # Strategy 2: Contextual search query formulation using conversation history
        # If there is conversational history, ask the model to formulate the standalone search query
        try:
            # Build conversation history with a dedicated query formulation instruction
            query_messages = []
            # Include previous turns (up to last 6 turns for prompt brevity and high relevance)
            for m in messages[:-1][-6:]:
                query_messages.append({"role": m["role"], "content": m["content"]})

            query_messages.append({
                "role": "user",
                "content": (
                    f"We are executing a live web search for my latest input: \"{user_prompt}\".\n"
                    f"Based on our entire conversation history above and current date, what is the single most effective, "
                    f"fully-contextualized web search query to find the latest and most relevant information?\n"
                    f"Important: Resolve all pronouns, topics, and follow-up context (for example, if we were discussing tech news and I say 'cybersecurity', output 'latest cybersecurity tech news 2026').\n"
                    f"Respond ONLY with the search query text. Do not provide explanations, quotes, or conversational filler."
                ),
            })

            res = await ollama_service.chat(
                model=model,
                messages=query_messages,
                system_prompt=system_prompt,
            )
            raw_output = res.get("message", {}).get("content", "")
            cleaned = self.clean_query(raw_output, fallback_query)
            if cleaned and len(cleaned) >= 2:
                logger.info(f"Contextual formulation produced search query: {cleaned!r}")
                return cleaned

        except Exception as e:
            logger.warning(f"Contextual query formulation failed: {e}")

        # Ultimate fallback
        logger.info(f"Using fallback search query: {fallback_query!r}")
        return fallback_query

    async def perform_search(self, query: str, max_results: int = None) -> List[SearchResult]:
        if max_results is None:
            max_results = self.settings.SEARCH_MAX_RESULTS

        provider = get_search_provider()
        logger.info(f"Executing web search with provider '{provider.name}' for query: {query!r}")
        try:
            results = await provider.search(query, max_results=max_results)
            logger.info(f"Search provider '{provider.name}' returned {len(results)} results")
            return results
        except Exception as e:
            logger.error(f"Search failed with provider '{provider.name}': {e}", exc_info=True)
            return []

    def build_search_prompt_context(self, query: str, results: List[SearchResult]) -> str:
        """
        Builds a structured search context string to be appended to the model's system prompt.
        Instructs the model on citation formatting and factual grounding.
        """
        if not results:
            return (
                "\n\n[WEB SEARCH RESULT]\n"
                f"Web search was executed with query: \"{query}\", but no relevant online sources were retrieved. "
                "Inform the user that web search returned no live results and answer using your general knowledge."
            )

        source_blocks = []
        for idx, r in enumerate(results, start=1):
            source_blocks.append(
                f"[{idx}] Title: {r.title}\n"
                f"    URL: {r.url}\n"
                f"    Snippet: {r.snippet}"
            )

        sources_text = "\n\n".join(source_blocks)

        context = (
            "\n\n=== LIVE WEB SEARCH RESULTS (GROUNDING DATA) ===\n"
            f"The user enabled web search. Live web search results retrieved for query \"{query}\":\n\n"
            f"{sources_text}\n\n"
            "=== WEB SEARCH INSTRUCTIONS ===\n"
            "1. Ground your answer in the current web search results above.\n"
            "2. Whenever mentioning facts, figures, or claims from a specific source, cite it inline using markdown reference links or bracketed numbers like [1], [2] (or [Source Name](URL)).\n"
            "3. If the search results do not fully address the question, clearly state what information is known and what remains uncertain.\n"
            "4. Provide a well-structured, friendly, and complete response with headings, bullet points, and clean formatting."
        )
        return context


web_search_service = WebSearchService()
