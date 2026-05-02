---
name: cursor-api-test
description: >-
  Runs and verifies the cursor_api FastAPI application locally or in Docker:
  health checks, LinkedIn convert endpoint, env prerequisites, and optional pytest.
  Use when testing this codebase, smoke-testing after changes, debugging 502/504
  from Cursor Agent, or when the user asks how to test the API.
---

# cursor_api — testing

## Prerequisites

- Python 3 with dependencies from `requirements.txt`.
- `.env` based on `.env.example` (repo root). For **`POST /api/v1/convert`**, Cursor Agent must be usable from the runtime (host or container): `CURSOR_API_KEY`, `CURSOR_AGENT_PATH` if needed, and a sensible `CURSOR_AGENT_WORKSPACE`.

## Local (development server)

From the **repository root** (directory containing `app/`):

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Health (no Cursor dependency):**

```bash
curl -s http://127.0.0.1:8000/api/v1/health
```

Expect JSON like `{"status":"ok"}`.

**Convert (requires Cursor Agent + env):**

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/convert \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Short sample post to rewrite.\"}"
```

Expect `200` and `{"linkedin_text":"..."}`. `400` if input too long; `502`/`504` if the agent CLI fails or times out — check `.env` and logs.

**OpenAPI (optional):**

- Swagger UI: `http://127.0.0.1:8000/docs`

## Docker

From the repository root:

```bash
docker compose up --build
```

Then run the same `curl` commands against `http://127.0.0.1:8000`. Note `docker-compose.yml` sets `CURSOR_AGENT_WORKSPACE: /app`; ensure the Cursor CLI and credentials work inside the container if you rely on convert.

## What to verify after changes

- [ ] App starts without import errors.
- [ ] `GET /api/v1/health` returns 200.
- [ ] `POST /api/v1/convert` with valid short text returns 200 when Cursor is configured.
- [ ] Oversized body returns 400 with the max-length message.
- [ ] CORS still acceptable for intended clients (browser vs server-only).

## Automated tests (optional)

There is **no** `tests/` tree in this repo by default. To add coverage:

1. Add dev dependencies (example): `pytest`, `httpx`.
2. Use `fastapi.testclient.TestClient` or `httpx.AsyncClient` with `app.main.app` (or `create_app()`).
3. Mock `LinkedInRewriteService` or `cursor_agent_cli` for unit tests; keep one smoke test for `/health`.

Prefer testing business logic in `app/services/` with mocked integrations rather than calling the real CLI in CI unless secrets and binaries are available.

## Related

- Review checklist: `.cursor/skills/cursor-api-review/SKILL.md`
- FastAPI patterns: `.cursor/skills/fastapi-templates/SKILL.md`
