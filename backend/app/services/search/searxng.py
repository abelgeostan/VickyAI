import logging
from typing import List
import httpx

from app.services.search.base import BaseSearchProvider, SearchResult

logger = logging.getLogger("vickyai.search.searxng")


class SearXNGSearchProvider(BaseSearchProvider):
    """
    SearXNG search provider for self-hosted instances.
    Requires SEARXNG_BASE_URL in .env (e.g. http://searxng:8080).
    """

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    @property
    def name(self) -> str:
        return "searxng"

    async def search(self, query: str, max_results: int = 5) -> List[SearchResult]:
        query = query.strip()
        if not query or not self.base_url:
            return []

        url = f"{self.base_url}/search"
        params = {
            "q": query,
            "format": "json",
            "language": "en",
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(url, params=params)
                if resp.status_code != 200:
                    logger.error(f"SearXNG returned HTTP {resp.status_code}: {resp.text}")
                    return []

                data = resp.json()
                results_raw = data.get("results", [])
                results: List[SearchResult] = []

                for item in results_raw:
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
            logger.error(f"Error querying SearXNG: {e}")
            return []
