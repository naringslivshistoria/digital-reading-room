# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **monorepo-based microservices architecture** for a digital reading room system built on the Swedish Business History Foundation's archive system. The system consists of four main packages that work together to provide document search, viewing, and management capabilities.

## Architecture

```
Digital Reading Room
├── Frontend (React/Vite) - Port 4002
├── Search API (Koa) - Port 4001
├── Document Adapter (Koa) - Port 4000
└── Background Crawler (batch jobs)
```

Data flows from Comprima (SOAP API) → Elasticsearch → Frontend via Search API

## Quick Start

### Requirements
- Docker
- Node.js 18+
- pnpm 10.17.0

### Local Development with Docker Compose

```bash
# Run all services
docker compose up

# Run infrastructure only (useful for local package development)
docker compose up kibana postgres elasticsearch &
```

### Environment Setup

Create a `.envrc` file in the project root (use with direnv):

```bash
export COMPRIMA_SERVICE_URL=
export COMPRIMA_USER=
export COMPRIMA_PASSWORD=
export POSTGRES_USER=
export POSTGRES_PASSWORD=
export ELASTIC_PASSWORD=
export KIBANA_PASSWORD=
```

Run `direnv allow` after creating/modifying `.envrc`.

**VPN Requirement**: The comprima-adapter service requires VPN connection to reach Comprima.

## Packages

### 1. comprima-adapter (Port 4000)
Gateway to the Comprima document management system.

- **Tech**: Koa.js, SOAP client, Elasticsearch
- **Purpose**: Fetches documents from Comprima via SOAP, stores in Elasticsearch
- **Entry**: `packages/comprima-adapter/src/index.ts`
- **Key routes**: `/index/:documentId`, `/indexlevel?level=X`, `/documents`
- **Detailed docs**: `packages/comprima-adapter/CLAUDE.md`

### 2. comprima-crawler (Background Jobs)
Background service for document discovery and OCR processing.

- **Tech**: Node.js 20, Elasticsearch, PostgreSQL, FormData
- **Purpose**: Batch crawling of Comprima hierarchies, OCR processing via Qwen3-VL API
- **Entry**: `packages/comprima-crawler/src/index.ts`
- **Modes**: `MODE=index` (discovery) or `MODE=ocr` (text extraction)
- **Detailed docs**: `packages/comprima-crawler/CLAUDE.md`

### 3. reading-room-search (Port 4001)
REST API for search, authentication, and user management.

- **Tech**: Koa.js, Elasticsearch, PostgreSQL, JWT
- **Purpose**: Search API with authentication and access control
- **Entry**: `packages/reading-room-search/src/index.ts`
- **Key routes**: `/search/`, `/auth/login`, `/documents/:id`

### 4. reading-room-frontend (Port 4002)
React SPA for end users.

- **Tech**: React 17, Vite 6, TypeScript, Material-UI, Tailwind CSS
- **Purpose**: Document search interface and viewer
- **Entry**: `packages/reading-room-frontend/src/main.tsx`
- **Key routes**: `/search`, `/document/:id`, `/login`

## Common Development Commands

### Package Manager
This is a **pnpm monorepo**. Always use `pnpm` commands.

### Building & Running

**Frontend** (reading-room-frontend):
```bash
cd packages/reading-room-frontend
pnpm install
pnpm run dev          # Development server (Vite)
pnpm run build        # TypeScript + Vite build
pnpm run lint         # ESLint
pnpm run test         # Vitest
```

**Search API** (reading-room-search):
```bash
cd packages/reading-room-search
pnpm install
pnpm run start        # Runs migrations + starts server with ts-node
pnpm run dev          # Nodemon with auto-reload
pnpm run test         # Jest tests
pnpm run lint         # ESLint
pnpm run migrate:up   # Run database migrations
pnpm run migrate:make # Create new migration
```

**Comprima Adapter** (comprima-adapter):
```bash
cd packages/comprima-adapter
pnpm install
pnpm run start        # Start server with ts-node
pnpm run dev          # Nodemon with auto-reload
pnpm run test         # Jest tests
pnpm run lint         # ESLint
```

**Crawler** (comprima-crawler):
```bash
cd packages/comprima-crawler
pnpm install
pnpm run start        # Runs migrations + starts batch job
pnpm run dev          # Nodemon with auto-reload
pnpm run test         # Jest tests
pnpm run lint         # ESLint
pnpm run migrate:up   # Run database migrations
```

### Testing

**Frontend tests**: Use Vitest (not Jest)
```bash
cd packages/reading-room-frontend
pnpm run test         # Run all tests
pnpm run test:watch   # Watch mode (vitest without 'run')
pnpm run test:ui      # Vitest UI
```

**Backend tests**: Use Jest with Supertest
```bash
cd packages/<backend-package>
pnpm run test         # Run all tests
pnpm run test:watch   # Watch mode
```

**Note**: Tests are currently disabled in CI (commented out in `.github/workflows/pr.yaml`)

### Linting

All packages use ESLint with TypeScript support:
```bash
pnpm run lint         # Run linter (from any package directory)
```

CI runs linting on all PRs against main branch.

## Key Technologies

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + Vite | 17 + 6.3.4 |
| Backend | Koa.js | 2.x |
| Database | PostgreSQL | 12+ |
| Search | Elasticsearch | 8.x |
| OCR | Qwen3-VL API | External service |
| Testing | Jest/Vitest | 27 / 3.0.8 |
| Language | TypeScript | 4.x |
| Package Manager | pnpm | 10.17.0 |

## Important Patterns & Conventions

### Configuration
Uses `@iteam/config` for environment-based configuration:
- Defaults in code
- Environment variables override
- Support for `config.json` files

### Database Migrations
- Use Knex.js for schema migrations
- Run with `pnpm run migrate:up` on service startup
- Separate migrations for reading-room-search and comprima-crawler

### Authentication
- JWT tokens stored in httpOnly cookies
- Session-based fallback with koa-session
- Access control via user role arrays (depositors, archiveInitiators, series, volumes)

### Error Handling
- Error handler middleware in all Koa apps
- Elasticsearch health checks on startup
- Retry logic with axios-retry

### TypeScript
- Strict mode configuration across all packages
- Shared types in `src/common/types.ts`
- Type-safe Elasticsearch queries

## Environment Variables

**Elasticsearch**:
- `ELASTICSEARCH_URL` or `ELASTIC_SEARCH__URL`

**PostgreSQL**:
- `POSTGRES__HOST`, `POSTGRES__USER`, `POSTGRES__PASSWORD`, `POSTGRES__PORT`
- `DATABASE_URL` (connection string alternative)

**Comprima**:
- `COMPRIMA_URL` or `COMPRIMA_SERVICE_URL`

**OCR**:
- `OCR_API_URL` (default: `http://host.docker.internal:8000`)
- `OCR__BATCH_SIZE` (default: 1)
- `OCR__DESCRIPTION_LANGUAGE` (default: 'sv' for Swedish)
- `OCR__DPI` (default: 200)

**Frontend**:
- `VITE_COOKIE_DOMAIN`
- `COOKIE_DOMAIN=localhost` (for local development)

**Crawler**:
- `MODE` - Set to 'index' or 'ocr'

## Deployment

- **Container**: Docker with individual Dockerfiles per package
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
  - PR: Lint only
  - Push to main: Build, version bump (patch), Docker push to GHCR
- **Registry**: GitHub Container Registry (ghcr.io)
- **Versioning**: Automated patch bumps on push, minor on staging tag, major on production tag

## Troubleshooting

### Kibana Access

```bash
# Open tunnel to Kibana
kubectl -n production port-forward services/kibana-kibana 5601  # or -n ci
```

Open http://localhost:5601, create index pattern `comprima` if needed, then use Discover tab.

**Find documents with OCR text**:
```json
{
  "query": {
    "bool": {
      "must": {
        "exists": {
          "field": "ocrText"
        }
      }
    }
  }
}
```

### Production Database Access

**Elasticsearch** (non-default port to avoid accidents):
```bash
kubectl -n elasticsearch port-forward elasticsearch-master-0 19200:9200
# Access at http://localhost:19200/_cat/indices?v
```

**PostgreSQL** (non-default port to avoid accidents):
```bash
kubectl -n postgres port-forward postgres-postgresql-0 15432:5432
```
