from __future__ import annotations

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from app.api.v1.router import api_router
from app.core.config import API_V1_STR, CORS_ORIGINS, get_settings


@asynccontextmanager
async def lifespan(_app: FastAPI):
    settings = get_settings()
    if settings.CURSOR_AGENT_PATH:
        os.environ["CURSOR_AGENT_PATH"] = settings.CURSOR_AGENT_PATH
    if settings.CURSOR_API_KEY and not os.environ.get("CURSOR_API_KEY"):
        os.environ["CURSOR_API_KEY"] = settings.CURSOR_API_KEY
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="LinkedIn tone (Cursor Agent)",
        version="0.2.0",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix=API_V1_STR)
    return app


app = create_app()
