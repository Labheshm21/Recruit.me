"""Debug entrypoint that re-exports the primary FastAPI app."""

from .main import app

__all__ = ["app"]
