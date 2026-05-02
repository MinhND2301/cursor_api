# LinkedIn Style Rewriter

A full-stack application that rewrites casual text into a polished LinkedIn-style sentence.

This repository includes:

- A FastAPI backend that calls Cursor Agent CLI for rewriting
- A React frontend (Vite) for a simple web interface
- Docker configuration to run both services together

## Project Structure

```text
cursor_api/
  app/                     # FastAPI backend
    api/                   # Routes and endpoint handlers
    core/                  # Settings and constants
    integrations/          # Cursor Agent CLI integration
    prompts/               # Prompt builders
    services/              # Business logic
  frontend/                # React frontend (Vite)
  docker-compose.yml       # Multi-service local setup
  Dockerfile               # Backend image
```

## Requirements

### Local (without Docker)

- Python 3.12+
- Node.js 20+
- Cursor Agent CLI available as `agent` (or set `CURSOR_AGENT_PATH`)
- A valid `CURSOR_API_KEY`

### Docker

- Docker Desktop with Compose support

## Environment Variables

Create a `.env` file in the repository root.

Minimum required:

```env
CURSOR_API_KEY=your_key_here
```

Optional tuning:

```env
CURSOR_AGENT_MODE=ask
CURSOR_AGENT_TIMEOUT_SEC=90
CURSOR_AGENT_MODEL=
```

Notes:

- `ask` is the default fast path for this use case.
- `CURSOR_AGENT_MODEL` is optional; if empty, the CLI default model is used.

## Run with Docker (recommended)

From the repository root:

```bash
docker compose up --build
```

Services:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8000](http://localhost:8000)
- Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Run Locally (without Docker)

Use two terminals.

### 1) Backend

```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: [http://localhost:5173](http://localhost:5173)

## API Endpoints

### `GET /api/v1/health`

Returns:

```json
{"status":"ok"}
```

### `POST /api/v1/convert`

Request:

```json
{"text":"your casual sentence"}
```

Success response:

```json
{"linkedin_text":"rewritten sentence"}
```

Error behavior:

- `400` for empty or overly long input
- `502` when Cursor Agent returns an execution error
- `504` when Cursor Agent times out

## Frontend Configuration

The frontend reads backend base URL from:

- `VITE_API_BASE_URL` (defaults to `http://localhost:8000`)

In Docker Compose, it is already set for local browser access.

## Troubleshooting

### Backend starts but `/convert` fails

- Confirm `.env` has a valid `CURSOR_API_KEY`
- Confirm `agent --version` works
- If needed, set `CURSOR_AGENT_PATH` to the full CLI path

### Frontend cannot reach API

- Verify backend is running on `http://localhost:8000`
- Check browser devtools network tab for request errors
- Confirm `VITE_API_BASE_URL` is correct for your run mode

## Development Notes

- Prompts are defined in `app/prompts/` as Python code.
- Rewriting flow is:
  - API endpoint -> service -> prompt builder -> Cursor Agent CLI
- The backend uses async request handling and offloads CLI execution to a thread.
