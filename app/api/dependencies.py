from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from app.core.config import Settings, get_settings
from app.services.linkedin_rewrite_service import LinkedInRewriteService


def get_linkedin_service(
    settings: Annotated[Settings, Depends(get_settings)],
) -> LinkedInRewriteService:
    return LinkedInRewriteService(settings)
