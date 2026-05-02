from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_PROJECT_ROOT = Path(__file__).resolve().parents[2]

API_V1_STR = "/api/v1"
CORS_ORIGINS: list[str] = [
    o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()
]
MAX_INPUT_CHARS = 4000


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    CURSOR_AGENT_WORKSPACE: Path = Field(default=_PROJECT_ROOT)
    CURSOR_AGENT_PATH: str | None = None
    CURSOR_API_KEY: str | None = None
    # ask = one-shot Q&A (default, faster). plan = read-only planning (slower).
    CURSOR_AGENT_MODE: str = Field(default="ask")
    CURSOR_AGENT_TIMEOUT_SEC: float = Field(default=90.0)
    CURSOR_AGENT_MODEL: str | None = Field(default=None)


@lru_cache
def get_settings() -> Settings:
    return Settings()
