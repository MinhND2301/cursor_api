"""Run the Cursor Agent CLI in headless (print) mode."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path


class AgentCliError(Exception):
    """The agent process failed or returned an unexpected payload."""

    def __init__(self, message: str, *, stderr: str | None = None, exit_code: int | None = None):
        super().__init__(message)
        self.stderr = stderr
        self.exit_code = exit_code


def resolve_agent_executable() -> str:
    override = os.environ.get("CURSOR_AGENT_PATH")
    if override:
        return override
    found = shutil.which("agent")
    if not found:
        raise AgentCliError(
            "Cursor Agent CLI not found. Install Cursor Agent and ensure `agent` is on PATH, "
            "or set CURSOR_AGENT_PATH to the agent executable."
        )
    return found


def run_agent_print(
    prompt: str,
    *,
    workspace: Path,
    timeout_sec: float,
    model: str | None = None,
    mode: str = "ask",
) -> str:
    exe = resolve_agent_executable()
    cmd: list[str] = [
        exe,
        "-p",
        "--output-format",
        "json",
        "--mode",
        mode,
        "--workspace",
        str(workspace.resolve()),
        "--trust",
        prompt,
    ]
    if model:
        cmd.insert(-1, "--model")
        cmd.insert(-1, model)

    proc = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=timeout_sec,
        cwd=str(workspace.resolve()),
        env=os.environ.copy(),
    )

    if proc.returncode != 0:
        raise AgentCliError(
            "Cursor Agent exited with an error.",
            stderr=(proc.stderr or "").strip() or None,
            exit_code=proc.returncode,
        )

    raw = (proc.stdout or "").strip()
    if not raw:
        raise AgentCliError(
            "Cursor Agent returned empty stdout.",
            stderr=(proc.stderr or "").strip() or None,
            exit_code=proc.returncode,
        )

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as e:
        raise AgentCliError(f"Invalid JSON from agent: {e}") from e

    if payload.get("type") != "result":
        raise AgentCliError(f"Unexpected agent payload type: {payload.get('type')!r}")

    if payload.get("is_error") or payload.get("subtype") != "success":
        raise AgentCliError(
            "Agent reported a failed result.",
            stderr=json.dumps(payload)[:2000],
            exit_code=proc.returncode,
        )

    result = payload.get("result")
    if not isinstance(result, str) or not result.strip():
        raise AgentCliError("Agent result missing or empty.")

    return result.strip()
