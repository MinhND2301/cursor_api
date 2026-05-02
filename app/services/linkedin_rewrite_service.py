from __future__ import annotations

import asyncio
import subprocess
from pathlib import Path

from app.core.config import Settings
from app.integrations.cursor_agent_cli import AgentCliError, run_agent_print
from app.prompts import build_linkedin_rewrite_prompt


class LinkedInRewriteService:
    """Orchestrates LinkedIn-style rewrites via the Cursor Agent CLI."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._workspace = Path(settings.CURSOR_AGENT_WORKSPACE)

    async def rewrite(self, casual: str) -> str:
        prompt = build_linkedin_rewrite_prompt(casual)
        try:
            return await asyncio.to_thread(
                run_agent_print,
                prompt,
                workspace=self._workspace,
                timeout_sec=self._settings.CURSOR_AGENT_TIMEOUT_SEC,
                model=self._settings.CURSOR_AGENT_MODEL,
                mode=self._settings.CURSOR_AGENT_MODE,
            )
        except AgentCliError:
            raise
        except subprocess.TimeoutExpired as e:
            raise TimeoutError("Cursor Agent timed out.") from e
