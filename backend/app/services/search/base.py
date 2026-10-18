from abc import ABC, abstractmethod
from typing import List
from pydantic import BaseModel, Field


class SearchResult(BaseModel):
    title: str = Field(..., description="Title of the search result")
    url: str = Field(..., description="URL of the search source")
    snippet: str = Field(default="", description="Snippet or summary text from the page")


class BaseSearchProvider(ABC):
    """Abstract Base Class for web search providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider identifier name, e.g. 'duckduckgo', 'tavily'."""
        pass

    @abstractmethod
    async def search(self, query: str, max_results: int = 5) -> List[SearchResult]:
        """
        Execute web search asynchronously.
        Returns a list of SearchResult items.
        """
        pass
