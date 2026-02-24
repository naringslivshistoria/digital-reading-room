# reading-room-frontend

End-user search interface for the CFN Digital Reading Room. Built with React, Vite and Material-UI.

## Requirements

- Node.js 18
- pnpm
- `reading-room-search` running on port 4001

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

Runs on **port 4002**. API requests to `/api/*` are proxied to `reading-room-search` on port 4001.

## Environment variables

Create `.env.local` in this package directory if you need to override defaults:

```bash
VITE_SEARCH_URL=   # defaults to /api (proxied to localhost:4001)
VITE_COOKIE_DOMAIN=
```

Leave `VITE_SEARCH_URL` empty for local development — the Vite proxy handles routing to the search API.

## Troubleshooting

### Empty dropdowns / no search results after logging in

If filter dropdowns (Deponent, Arkivbildare, Serie) are empty or searches return no results despite the API being reachable, you likely have a stale or mismatched `readingroom` auth cookie. This happens when:

- You previously logged into the production site and still have that cookie
- You switched between local and production environments
- You logged in while the search service was running a different JWT secret

**Fix:** Open DevTools → Application → Cookies → `localhost:4002` → clear all cookies, then log in again at `/login`.

### Search returns 500 errors

Check that the `ELASTIC_SEARCH__INDEX_NAME` in your `.envrc` matches the actual index name on the Elasticsearch cluster you are connected to. See `reading-room-search/README.md` for instructions.

## Tests

```bash
pnpm test        # run once
pnpm test:watch  # watch mode
pnpm test:ui     # Vitest UI
```

## Lint

```bash
pnpm lint
```
