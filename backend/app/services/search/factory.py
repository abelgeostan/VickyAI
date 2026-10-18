import logging
from typing import Optional

from app.config import get_settings
from app.services.search.base import BaseSearchProvider
from app.services.search.duckduckgo import DuckDuckGoSearchProvider
from app.services.search.tavily import TavilySearchProvider
from app.services.search.brave import BraveSearchProvider
from app.services.search.searxng import SearXNGSearchProvider

logger = logging.getLogger("vickyai.search.factory")


def get_search_provider(provider_name: Optional[str] = None) -> BaseSearchProvider:
    """
    Factory function to obtain the configured search provider.
    Defaults to settings.SEARCH_PROVIDER (default: 'duckduckgo').
    Falls back gracefully to DuckDuckGo if an API key is missing.
    """
    settings = get_settings()
    name = (provider_name or settings.SEARCH_PROVIDER or "duckduckgo").lower().strip()

    if name == "tavily":
        if settings.TAVILY_API_KEY:
            return TavilySearchProvider(api_key=settings.TAVILY_API_KEY)
        logger.warning("TAVILY_API_KEY not configured. Falling back to DuckDuckGo search.")

    elif name == "brave":
        if settings.BRAVE_API_KEY:
            return BraveSearchProvider(api_key=settings.BRAVE_API_KEY)
        logger.warning("BRAVE_API_KEY not configured. Falling back to DuckDuckGo search.")

    elif name == "searxng":
        if settings.SEARXNG_BASE_URL:
            return SearXNGSearchProvider(base_url=settings.SEARXNG_BASE_URL)
        logger.warning("SEARXNG_BASE_URL not configured. Falling back to DuckDuckGo search.")

    # Default provider: DuckDuckGo (zero config required)
    return DuckDuckGoSearchProvider()
