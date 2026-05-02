---
name: cursor-api-review
description: >-
  Reviews the cursor_api FastAPI service (LinkedIn rewrite via Cursor Agent CLI)
  for correctness, security, config, and ops. Use when reviewing this repository,
  before merge, or when the user asks for a code review of the API, Docker setup,
  or Cursor Agent integration.
---

# cursor_api — code review

## Scope

This skill applies to the **cursor_api** project: FastAPI app under `app/`, Docker, and env-driven Cursor Agent subprocess usage.

**Layout to keep in mind:**

- `app/main.py` — app factory, CORS, lifespan (Cursor env injection)
- `app/api/v1/` — routers and endpoints (`health`, `linkedin`)
- `app/core/config.py` — `Settings`, `API_V1_STR`, limits, CORS list
- `app/services/linkedin_rewrite_service.py` — business logic
- `app/prompts/` — file-backed agent instructions (e.g. `linkedin_rewrite.txt`)
- `app/integrations/cursor_agent_cli.py` — CLI / subprocess boundary only (`run_agent_print`)
- `app/schemas/` — Pydantic request/response models
- `app/api/dependencies.py` — FastAPI `Depends` wiring

## Review workflow

1. Read the changed files and their call sites (imports, routers, lifespan, Docker env).
2. Trace the request path for HTTP changes: router → dependency → service → integration.
3. Check config: new settings belong in `Settings` + `.env.example`; no secrets committed.
4. Note Docker impact: `Dockerfile`, `docker-compose.yml`, `CURSOR_AGENT_WORKSPACE`, paths, timeouts.

## Checklist

**API and contracts**

- [ ] Request/response models match documented behavior; validation messages are safe to expose.
- [ ] Status codes are appropriate (4xx client, 5xx server/dependency failures).
- [ ] `MAX_INPUT_CHARS` and similar limits enforced consistently.

**Security and reliability**

- [ ] No injection via unsanitized strings into shells; subprocess/CLI usage is bounded and escaped as needed.
- [ ] Errors from subprocess/CLI do not leak secrets in `detail` or logs.
- [ ] CORS: `CORS_ORIGINS` is `["*"]` by default — flag if production needs a restricted list.
- [ ] Timeouts and cancellation paths are considered for long-running agent calls.

**Config and ops**

- [ ] `get_settings()` / `lru_cache` invalidation if tests need fresh settings.
- [ ] `.env.example` updated when new env vars are required.
- [ ] Docker: working directory, `CURSOR_AGENT_PATH`, API keys, and workspace mount align with how the CLI runs.

**Code quality**

- [ ] Async boundaries respected; blocking work not in async handlers without offload.
- [ ] Dependencies are thin; logic stays in services.
- [ ] Exceptions mapped to HTTP errors in routers (e.g. `AgentCliError`, `TimeoutError`) consistently.

## Feedback format

Use severity labels:

- **Critical** — wrong behavior, security issue, data loss, or broken deploy.
- **Suggestion** — clarity, maintainability, or minor robustness.
- **Nice to have** — style or future-proofing.

End with a short **Summary** (merge readiness in one paragraph).

## Related

For greenfield FastAPI structure or patterns, see the project skill `fastapi-templates` (`.cursor/skills/fastapi-templates/SKILL.md`).
