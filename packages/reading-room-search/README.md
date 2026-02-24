# reading-room-search

Search API for the CFN Digital Reading Room. Built with Koa.js, Elasticsearch and PostgreSQL.

## Requirements

- Node.js 18
- pnpm
- PostgreSQL (local or port-forwarded)
- Elasticsearch (local or port-forwarded from production)

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev   # starts with nodemon (auto-reload on file changes)
pnpm start # runs migrations then starts server
```

Runs on **port 4001**.

## Running against the production Elasticsearch cluster

This is the recommended approach for local development — no local indexing required.

### 1. Update your kubeconfig

Get the latest `cfn-config` from Bitwarden and place it at `~/.kube/cfn-config`:

```bash
export KUBECONFIG=~/.kube/cfn-config
```

### 2. Port-forward the production Elasticsearch cluster

```bash
kubectl port-forward -n production svc/elastic-cluster 9200:9200
```

### 3. Set the correct index name

The production index name must match what the cluster actually uses. Check with:

```bash
curl 'http://localhost:9200/_cat/indices?v'
```

At time of writing the index is **`comprima-new`**. Set this in your `.envrc`:

```bash
export ELASTIC_SEARCH__INDEX_NAME=comprima-new
export ELASTIC_SEARCH__URL=http://localhost:9200
```

Then reload: `direnv allow`

## Authentication

The service uses JWT cookies (`readingroom`) and koa-session for user state.

### Login accounts

User access to documents is controlled by `depositors`/`archiveInitiators` columns in the PostgreSQL `users` table. A user with `null` depositors has unrestricted access to all documents.

For local development, use the **`admin`** account (null depositors = full access to all data).

### Clearing stale cookies

If you switch between environments (local ↔ production) or log in as a different user and see empty search results or empty filter dropdowns, you could have a stale `readingroom` cookie signed by a different JWT secret.

**Fix:** Open DevTools → Application → Cookies → `localhost:4002` → clear all cookies, then log in again.

## Environment variables

Key variables (set via `.envrc` at the project root):

| Variable | Default | Description |
|---|---|---|
| `ELASTIC_SEARCH__URL` | `http://localhost:9200` | Elasticsearch URL |
| `ELASTIC_SEARCH__INDEX_NAME` | `comprima` | Index name — must match cluster |
| `COOKIE_DOMAIN`  | `dev.cfn.iteam.se` | Set to `localhost` for local dev |
| `POSTGRES__HOST` | `127.0.0.1` | PostgreSQL host |
| `POSTGRES__PORT` | `5433` | PostgreSQL port |
| `SESSION_SECRET` | *(hardcoded default)* | koa-session secret |

## Tests

```bash
pnpm test
```
