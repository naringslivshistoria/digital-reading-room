# Digital Läsesal

Monorepo for the CFN Digital Reading Room — a document search and viewing platform built on the Swedish Business History Foundation's archive system.

## Architecture

```
Digital Reading Room
├── reading-room-frontend  (React/Vite)   Port 4002
├── reading-room-search    (Koa.js)       Port 4001
├── comprima-adapter       (Koa.js)       Port 4000
└── comprima-crawler       (Node.js, batch jobs)
```

Data flows from **Comprima** (SOAP API) → **Elasticsearch** → **reading-room-frontend** via **reading-room-search**.

### Packages

| Package | Port | Purpose |
|---|---|---|
| `reading-room-frontend` | 4002 | End-user search and document viewer (React SPA) |
| `reading-room-search` | 4001 | Search API, authentication, access control |
| `comprima-adapter` | 4000 | HTTP→SOAP gateway to Comprima |
| `comprima-crawler` | — | Batch indexing and OCR processing |

## Requirements

- Docker
- Node.js 18+
- pnpm 10.17.0
- kubectl / kubectx (for production access)

```bash
brew install jq kubectl kubectx

# Recommended quality-of-life tools:
brew install direnv nvm
# Remember to set up shell hooks for direnv and nvm
```

## Quick start

### Option A — Full stack via Docker Compose

```bash
docker compose up
```

### Option B — Infrastructure only (recommended for package development)

Run Postgres, Elasticsearch and Kibana in Docker, then start individual packages locally:

```bash
docker compose up kibana postgres elasticsearch &

cd packages/reading-room-search && pnpm install && pnpm dev
cd packages/reading-room-frontend && pnpm install && pnpm dev
```

### Option C — Against production Elasticsearch

No local indexing required. See `packages/reading-room-search/README.md` for full setup instructions, including the required kubectl port-forward and index name configuration.

## Environment setup

This project uses [direnv](https://direnv.net/). Create a `.envrc` file in the project root:

```bash
export COMPRIMA_SERVICE_URL=
export COMPRIMA_USER=
export COMPRIMA_PASSWORD=
export COMPRIMA_USER_TEST=
export COMPRIMA_PASSWORD_TEST=
export POSTGRES_USER=
export POSTGRES_PASSWORD=
export POSTGRES__USER=postgres
export POSTGRES__PASSWORD=postgrespassword
export POSTGRES__HOST=127.0.0.1
export POSTGRES__PORT=5433
export POSTGRES__DATABASE=readingroom
export ELASTIC_PASSWORD=
export KIBANA_PASSWORD=
export ELASTIC_SEARCH__URL=http://localhost:9200
export ELASTIC_SEARCH__INDEX_NAME=comprima-new
export COOKIE_DOMAIN=localhost
export SESSION_SECRET=dev-session-secret
export MODE=index
```

Run `direnv allow` after creating or modifying `.envrc`.

> **Note:** `ELASTIC_SEARCH__INDEX_NAME` must match the actual index name on your Elasticsearch cluster. Check with `curl 'http://localhost:9200/_cat/indices?v'`.

### Per-package configuration

**reading-room-search**: requires `COOKIE_DOMAIN=localhost`

**reading-room-frontend**: requires `VITE_COOKIE_DOMAIN=localhost` (set in `packages/reading-room-frontend/.env.local`)

## Development commands

This is a **pnpm monorepo**. Always use `pnpm`.

**reading-room-frontend:**
```bash
cd packages/reading-room-frontend
pnpm install && pnpm dev      # Vite dev server on :4002
pnpm build                    # Production build
pnpm test                     # Vitest
pnpm lint
```

**reading-room-search:**
```bash
cd packages/reading-room-search
pnpm install && pnpm dev      # Nodemon + ts-node on :4001
pnpm test                     # Jest
pnpm lint
pnpm run migrate:up           # Run DB migrations manually
pnpm run migrate:make         # Create a new migration
```

**comprima-adapter:**
```bash
cd packages/comprima-adapter
pnpm install && pnpm dev      # Nodemon + ts-node on :4000
pnpm test
pnpm lint
```

**comprima-crawler:**
```bash
cd packages/comprima-crawler
pnpm install && pnpm dev      # MODE=index or MODE=ocr
pnpm test
pnpm lint
pnpm run migrate:up
```

## Technology stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + Vite | 17 + 6.3.4 |
| Backend | Koa.js | 2.x |
| Database | PostgreSQL | 12+ |
| Search | Elasticsearch | 8.x |
| OCR | Qwen3-VL API | External service |
| Testing | Jest / Vitest | 27 / 3.0.8 |
| Language | TypeScript | 4.x |
| Package manager | pnpm | 10.17.0 |

## CI/CD

Uses **GitHub Actions**. Docker images are stored in the [GitHub Container Registry](https://github.com/orgs/naringslivshistoria/packages).

| Trigger | Action |
|---|---|
| PR against main | Lint all packages |
| Push to main | Build + patch version bump + push to GHCR |
| Staging tag | Minor version bump |
| Production tag | Major version bump |

If builds or deploys are failing, check [githubstatus.com](https://www.githubstatus.com).

## Operations

All services run on Kubernetes. See the [Operations repo](https://github.com/naringslivshistoria/operations-new) for details.

> **VPN requirement:** The `comprima-adapter` service requires VPN to reach Comprima. See the Operations repo for VPN configuration.

### Kubernetes access

```bash
# Kibana (document inspection)
kubectl -n production port-forward services/kibana-kibana 5601   # or -n ci

# Elasticsearch — use non-default port to avoid accidents
kubectl -n production svc/elastic-cluster 9200:9200
# or the elasticsearch namespace cluster:
kubectl -n elasticsearch port-forward elasticsearch-master-0 19200:9200

# PostgreSQL — use non-default port to avoid accidents
kubectl -n postgres port-forward postgres-postgresql-0 15432:5432
```

## Troubleshooting

### Inspecting documents in Kibana

Open [http://localhost:5601](http://localhost:5601) after port-forwarding. Create the index pattern (e.g. `comprima-new`) if it does not already exist, then go to Discover → Add filter → Edit as Query DSL.

**Find all documents with OCR text:**
```json
{
  "query": {
    "bool": {
      "must": { "exists": { "field": "ocrText" } }
    }
  }
}
```

**Find all documents with an `ocrStatus` field:**
```json
{
  "query": {
    "bool": {
      "must": { "exists": { "field": "ocrStatus" } }
    }
  }
}
```

### Empty search results / empty filter dropdowns

See `packages/reading-room-search/README.md` — most likely a stale auth cookie or a mismatched `ELASTIC_SEARCH__INDEX_NAME`.
