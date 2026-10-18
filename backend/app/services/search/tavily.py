import logging
from typing import List, Optional
import httpx

from app.services.search.base import BaseSearchProvider, SearchResult

logger = logging.getLogger("vickyai.search.tavily")


class TavilySearchProvider(BaseSearchProvider):
    """
    Tavily search provider.
    Tavily is purpose-built for LLM and RAG agents.
    Requires TAVILY_API_KEY in .env.
    """

    def __init__(self, api_key: str):
        self.api_key = api_key

    @property
    def name(self) -> str:
        return "tavily"

    async def search(self, query: str, max_results: int = 5) -> List[SearchResult]:
        query = query.strip()
        if not query or not self.api_key:
            return []

        url = "https://api.tavily.com/search"
        payload = {
            "api_key": self.api_key,
            "query": query,
            "max_results": max_results,
            "search_depth": "basic",
            "include_answer": False,
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code != 200:
                    logger.error(f"Tavily search API returned HTTP {resp.status_code}: {resp.text}")
                    return []

                data = resp.json()
                raw_results = data.get("results", [])
                results: List[SearchResult] = []

                for item in raw_results:
                    title = item.get("title", "").strip()
                    item_url = item.get("url", "").strip()
                    snippet = item.get("content", "").strip()
                    if title and item_url:
                        results.append(
                            SearchResult(
                                title=title,
                                url=item_url,
                                snippet=snippet,
                            )
                        )
                return results[:max_results]
        except Exception as e:
            logger.error(f"Error querying Tavily API: {e}")
            return []
