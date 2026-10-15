# foretagskallan-api

Backend for Företagskällan, an AI chat where students explore CFN's archives.

The first version contains login against the reading room's user database and a chat endpoint that streams answers from an LLM. Vector search and source citations will be added later.

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

## API

| Method | Path | Login | Description |
|---|---|---|---|
| `GET` | `/health` | no | Checks the database connection |
| `POST` | `/auth/login` | no | `{ username, password }`, sets the `foretagskallan` cookie. Requires the `foretagskallan` platform in `user_platforms` |
| `POST` | `/auth/logout` | no | Removes the cookie |
| `GET` | `/auth/me` | yes | The logged-in user and their depositors |
| `POST` | `/chat` | yes | `{ messages: [{ role, content }] }`, responds with `text/event-stream` (`delta`, `done`, `error`) |

Example:

```sh
curl -c jar -H 'Content-Type: application/json' \
  -d '{"username":"elev@skola.se","password":"..."}' localhost:4010/auth/login
curl -N -b jar -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Vad gjorde ASEA?"}]}' localhost:4010/chat
```

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
