# foretagskallan-api

Backend for Företagskällan, an AI chat where students explore CFN's archives.

Contains login against the reading room's user database and a chat endpoint that streams answers from the agent (RAG). For now the agent is a mock with made-up sources; the real one is built in `src/services/agentService/`.

## Running locally

Requires Node 22+ and a Postgres with the reading room's `users` table (see `reading-room-search`, which owns the migrations).

```sh
pnpm install
pnpm dev
```

Configuration is set via environment variables (`@iteam/config`, double underscore for nesting) or a `config.json` in the package root:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port | `4010` |
| `CORS_ORIGIN` | The frontend's origin | `http://localhost:5173` |
| `POSTGRES__HOST`, `__PORT`, `__USER`, `__PASSWORD`, `__DATABASE` | The reading room's database | `127.0.0.1:5433/readingroom` |
| `AUTH__SECRET` | JWT secret | development only |
| `AUTH__COOKIE_DOMAIN` | Cookie domain | `localhost` |
| `AUTH__COOKIE_SECURE` | `true` behind HTTPS | `false` |
| `LLM__BASE_URL` | OpenAI-compatible API (Azure OpenAI v1, Berget, vLLM) | `http://localhost:8000/v1` |
| `LLM__API_KEY` | API key | – |
| `LLM__MODEL` | Model name/deployment | – |
| `AGENT__MODE` | `mock` (made-up answer with sources) or `llm` (the LLM directly, without sources) | `mock` |
| `AGENT__MOCK_DELAY_MS` | Pause between words in the mock | `40` |

## API

| Method | Path | Login | Description |
|---|---|---|---|
| `GET` | `/health` | no | Checks the database connection |
| `POST` | `/auth/login` | no | `{ username, password }`, sets the `foretagskallan` cookie. Requires the `foretagskallan` platform in `user_platforms` |
| `POST` | `/auth/logout` | no | Removes the cookie |
| `GET` | `/auth/me` | yes | The logged-in user and their depositors |
| `POST` | `/chat` | yes | `{ messages: [{ role, content }] }`, responds with `text/event-stream` (see below) |

Example:

```sh
curl -c jar -H 'Content-Type: application/json' \
  -d '{"username":"elev@skola.se","password":"..."}' localhost:4010/auth/login
curl -N -b jar -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Vad gjorde ASEA?"}]}' localhost:4010/chat
```

## The agent and the `/chat` events

`/chat` calls `askAgent({ userId, messages, signal })` in `src/services/agentService`. `userId` is `sub` from the verified JWT; the agent looks up the student's access rights itself (RLS), so no access rights are passed and nothing in the request body decides what the student may see.

The agent's events are forwarded as SSE. The source fields follow the reading room's ES documents:

```
event: sources
data: {"sources":[{"marker":1,"documentId":900001,"page":4,"title":"Styrelseprotokoll 1923","depositor":"Exempeldeponenten","archiveInitiator":"Exempel AB","seriesSignature":"A1","seriesName":"Styrelseprotokoll","volume":"1","snippet":"…"}]}

event: delta
data: {"section":"sourced","text":"Enligt styrelseprotokollet … [1]."}

event: delta
data: {"section":"general","text":"…"}

event: citations
data: {"valid":[1,2],"invalid":[]}

event: followups
data: {"questions":["Vem satt i styrelsen 1923?"]}

event: done
data: {"finishReason":"stop"}
```

If something fails after the stream has started, `event: error` with `{ "message": "…" }` is sent instead of `done`. The types are in `agentService/types.ts`.

## Platform access

A user only gets in if they have the row `foretagskallan` in the `user_platforms` table. It is set in backoffice. The table is created by a migration in `reading-room-search`. The check is made both at login and on every request, so revoked access takes effect at once (with a 60-second cache).

## Code shared with reading-room-search

The packages in the repo are standalone projects and are built with the package folder as Docker context in CI, so they can't import code from each other. Login (`hash`, `createToken`), `userAdapter`, `userService` and `authMiddleware` are therefore copied and must be kept in sync, especially the password hashing.

## Tests and lint

```sh
pnpm test
pnpm lint       # ESLint 10 + typescript-eslint, prettier rules
pnpm typecheck
```

ESLint 10 requires Node 20.19+, and `openai` requires Node 22+. CI reads the Node version from the package's `.nvmrc`.
