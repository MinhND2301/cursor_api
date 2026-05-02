from __future__ import annotations

import asyncio
import subprocess
from pathlib import Path

from app.core.config import (
    CURSOR_AGENT_MODE,
    CURSOR_AGENT_MODEL,
    CURSOR_AGENT_TIMEOUT_SEC,
    Settings,
)
from app.integrations.cursor_agent_cli import AgentCliError, casual_to_linkedin_sentence


class LinkedInRewriteService:
    """Orchestrates LinkedIn-style rewrites via the Cursor Agent CLI."""

    def __init__(self, settings: Settings) -> None:
        self._workspace = Path(settings.CURSOR_AGENT_WORKSPACE)

    async def rewrite(self, casual: str) -> str:
        try:
            return await asyncio.to_thread(
                casual_to_linkedin_sentence,
                casual,
                workspace=self._workspace,
                timeout_sec=CURSOR_AGENT_TIMEOUT_SEC,
                model=CURSOR_AGENT_MODEL,
                agent_mode=CURSOR_AGENT_MODE,
            )
        except AgentCliError:
            raise
        except subprocess.TimeoutExpired as e:
            raise TimeoutError("Cursor Agent timed out.") from e
