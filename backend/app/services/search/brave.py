import logging
from typing import List
import httpx

from app.services.search.base import BaseSearchProvider, SearchResult

logger = logging.getLogger("vickyai.search.brave")


class BraveSearchProvider(BaseSearchProvider):
    """
    Brave Search API provider.
    Requires BRAVE_API_KEY in .env.
    """

    def __init__(self, api_key: str):
        self.api_key = api_key

    @property
    def name(self) -> str:
        return "brave"

    async def search(self, query: str, max_results: int = 5) -> List[SearchResult]:
        query = query.strip()
        if not query or not self.api_key:
            return []

        url = "https://api.search.brave.com/res/v1/web/search"
        headers = {
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": self.api_key,
        }
        params = {
            "q": query,
            "count": min(max_results, 20),
        }

        try:
            async with httpx.AsyncClient(timeout=15.0, headers=headers) as client:
                resp = await client.get(url, params=params)
                if resp.status_code != 200:
                    logger.error(f"Brave Search API returned HTTP {resp.status_code}: {resp.text}")
                    return []

                data = resp.json()
                web_results = data.get("web", {}).get("results", [])
                results: List[SearchResult] = []

                for item in web_results:
                    title = item.get("title", "").strip()
                    item_url = item.get("url", "").strip()
                    snippet = item.get("description", "").strip()
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
            logger.error(f"Error querying Brave Search API: {e}")
            return []
