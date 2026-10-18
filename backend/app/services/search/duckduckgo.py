import html
import logging
import re
import urllib.parse
from typing import List
import httpx

from app.services.search.base import BaseSearchProvider, SearchResult

logger = logging.getLogger("vickyai.search.duckduckgo")


class DuckDuckGoSearchProvider(BaseSearchProvider):
    """
    DuckDuckGo search provider.
    Free, zero-configuration web search using lightweight HTML parsing.
    Requires no API keys.
    """

    DEFAULT_HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    @property
    def name(self) -> str:
        return "duckduckgo"

    async def search(self, query: str, max_results: int = 5) -> List[SearchResult]:
        query = query.strip()
        if not query:
            return []

        # 1. Try DuckDuckGo HTML endpoint
        results = await self._search_html(query, max_results)
        if results:
            return results

        # 2. Fallback to DuckDuckGo Lite endpoint
        logger.info("Falling back to DuckDuckGo Lite endpoint")
        return await self._search_lite(query, max_results)

    async def _search_html(self, query: str, max_results: int) -> List[SearchResult]:
        url = "https://html.duckduckgo.com/html/"
        try:
            async with httpx.AsyncClient(
                timeout=12.0, follow_redirects=True, headers=self.DEFAULT_HEADERS
            ) as client:
                resp = await client.post(url, data={"q": query})
                if resp.status_code != 200:
                    logger.warning(f"DuckDuckGo HTML returned status {resp.status_code}")
                    return []

                return self._parse_html_results(resp.text, max_results)
        except Exception as e:
            logger.warning(f"DuckDuckGo HTML search error: {e}")
            return []

    async def _search_lite(self, query: str, max_results: int) -> List[SearchResult]:
        url = "https://lite.duckduckgo.com/lite/"
        try:
            async with httpx.AsyncClient(
                timeout=12.0, follow_redirects=True, headers=self.DEFAULT_HEADERS
            ) as client:
                resp = await client.post(url, data={"q": query})
                if resp.status_code != 200:
                    logger.warning(f"DuckDuckGo Lite returned status {resp.status_code}")
                    return []

                return self._parse_lite_results(resp.text, max_results)
        except Exception as e:
            logger.warning(f"DuckDuckGo Lite search error: {e}")
            return []

    def _parse_html_results(self, html_text: str, max_results: int) -> List[SearchResult]:
        results: List[SearchResult] = []
        blocks = html_text.split('class="result results_links')

        for block in blocks[1:]:
            title_match = re.search(
                r'<a[^>]+class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>(.*?)</a>',
                block,
                re.DOTALL,
            )
            if not title_match:
                continue

            href = title_match.group(1)
            raw_title = title_match.group(2)

            # Resolve DuckDuckGo redirect uddg parameter
            if "uddg=" in href:
                qs = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
                if "uddg" in qs:
                    href = urllib.parse.unquote(qs["uddg"][0])

            # Extract snippet
            snippet_match = re.search(
                r'<a[^>]+class="[^"]*result__snippet[^"]*"[^>]*>(.*?)</a>',
                block,
                re.DOTALL,
            )
            raw_snippet = snippet_match.group(1) if snippet_match else ""

            clean_title = html.unescape(re.sub(r"<[^>]+>", "", raw_title)).strip()
            clean_snippet = html.unescape(re.sub(r"<[^>]+>", "", raw_snippet)).strip()

            if clean_title and href and not href.startswith("/"):
                results.append(
                    SearchResult(
                        title=clean_title,
                        url=href,
                        snippet=clean_snippet,
                    )
                )

            if len(results) >= max_results:
                break

        return results

    def _parse_lite_results(self, html_text: str, max_results: int) -> List[SearchResult]:
        results: List[SearchResult] = []
        # Lite version uses table rows: <a class='result-link' href="...">title</a>
        # Snippets: <td class='result-snippet'>snippet</td>
        link_matches = re.findall(
            r"<a[^>]+class=['\"]result-link['\"][^>]*href=['\"]([^'\"]+)['\"][^>]*>(.*?)</a>",
            html_text,
            re.DOTALL,
        )
        snippet_matches = re.findall(
            r"<td[^>]+class=['\"]result-snippet['\"][^>]*>(.*?)</td>",
            html_text,
            re.DOTALL,
        )

        for i, (href, raw_title) in enumerate(link_matches):
            if "uddg=" in href:
                qs = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
                if "uddg" in qs:
                    href = urllib.parse.unquote(qs["uddg"][0])

            raw_snippet = snippet_matches[i] if i < len(snippet_matches) else ""
            clean_title = html.unescape(re.sub(r"<[^>]+>", "", raw_title)).strip()
            clean_snippet = html.unescape(re.sub(r"<[^>]+>", "", raw_snippet)).strip()

            if clean_title and href and not href.startswith("/"):
                results.append(
                    SearchResult(
                        title=clean_title,
                        url=href,
                        snippet=clean_snippet,
                    )
                )

            if len(results) >= max_results:
                break

        return results
