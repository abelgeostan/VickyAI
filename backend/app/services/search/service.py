import logging
from typing import List, Tuple
from app.config import get_settings
from app.services.search.base import SearchResult
from app.services.search.factory import get_search_provider

logger = logging.getLogger("vickyai.search.service")


class WebSearchService:
    """Service to execute searches and format context for LLM generation."""

    def __init__(self):
        self.settings = get_settings()

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
                f"Web search was attempted for query: \"{query}\", but no relevant online sources were retrieved. "
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
            f"The user enabled web search. Live web search results for the user's query: \"{query}\":\n\n"
            f"{sources_text}\n\n"
            "=== WEB SEARCH INSTRUCTIONS ===\n"
            "1. Ground your answer in the current web search results above.\n"
            "2. Whenever mentioning facts, figures, or claims from a specific source, cite it inline using markdown reference links or bracketed numbers like [1], [2] (or [Source Name](URL)).\n"
            "3. If the search results do not fully address the question, clearly state what information is known and what remains uncertain.\n"
            "4. Provide a well-structured, friendly, and complete response with headings, bullet points, and clean formatting."
        )
        return context


web_search_service = WebSearchService()
