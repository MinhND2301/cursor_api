from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_linkedin_service
from app.core.config import MAX_INPUT_CHARS
from app.integrations.cursor_agent_cli import AgentCliError
from app.schemas.linkedin import ConvertRequest, ConvertResponse
from app.services.linkedin_rewrite_service import LinkedInRewriteService

router = APIRouter(tags=["linkedin"])


@router.post("/convert", response_model=ConvertResponse)
async def convert(
    body: ConvertRequest,
    svc: Annotated[LinkedInRewriteService, Depends(get_linkedin_service)],
) -> ConvertResponse:
    raw = body.text.strip()
    if len(raw) > MAX_INPUT_CHARS:
        raise HTTPException(
            status_code=400,
            detail=f"Input too long (max {MAX_INPUT_CHARS} characters).",
        )
    try:
        linkedin = await svc.rewrite(raw)
    except AgentCliError as e:
        detail = str(e)
        if e.stderr:
            detail = f"{detail} ({e.stderr[:500]})"
        raise HTTPException(status_code=502, detail=detail) from e
    except TimeoutError:
        raise HTTPException(status_code=504, detail="Cursor Agent timed out.") from None

    return ConvertResponse(linkedin_text=linkedin)
