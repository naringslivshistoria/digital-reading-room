# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**comprima-crawler** is a background batch processing service responsible for:
1. **Document Discovery** (`MODE=index`) - Crawling the Comprima hierarchy to find unindexed documents
2. **OCR Processing** (`MODE=ocr`) - Extracting text and descriptions from document images/PDFs using cfn-ocr service

This service runs as a Kubernetes CronJob in production and processes documents in batches.

## Architecture

```
Comprima-Crawler
├── MODE=index → Crawls Comprima levels → Finds unindexed docs → Stores in PostgreSQL
└── MODE=ocr   → Queries Elasticsearch → Downloads attachments → Sends to cfn-ocr → Updates Elasticsearch
```

**Key Dependencies**:
- **PostgreSQL**: Tracks crawling state (levels table)
- **Elasticsearch**: Document storage and OCR status tracking
- **Comprima Adapter**: SOAP gateway to Comprima system
- **cfn-ocr**: External OCR service using Qwen3-VL model (replaced Tesseract) - see [cfn-ocr repository](https://github.com/cfn/cfn-ocr)

**Entry Point**: `src/index.ts`

## Code Structure

```
src/
├── common/
│   ├── config.ts         # Configuration using @iteam/config
│   ├── log.ts            # Logging (chalk-based)
│   ├── types.ts          # Shared TypeScript types
│   └── translations.ts   # Comprima field translations
├── services/
│   ├── comprimaService/  # HTTP client for comprima-adapter
│   ├── crawlerService/   # Document discovery logic
│   ├── ocrService/       # OCR processing via cfn-ocr service
│   └── postgresAdapter/  # Database operations
└── index.ts              # Main entry point with mode switching
```

## Development Commands

```bash
pnpm install              # Install dependencies
pnpm run dev              # Run with auto-reload (nodemon)
pnpm run start            # Run migrations + start service
pnpm run test             # Run Jest tests
pnpm run test:watch       # Jest watch mode
pnpm run lint             # ESLint
pnpm run migrate:up       # Run database migrations
pnpm run migrate:down     # Rollback last migration
pnpm run seed             # Run database seeds
```

## Running Modes

### Index Mode (Default)
Discovers unindexed documents in Comprima hierarchy:

```bash
MODE=index pnpm run start
```

- Queries comprima-adapter for levels without indexed documents
- Stores discovered levels in PostgreSQL `levels` table
- Retries failed levels (tracks `attempts` counter)
- Exits with code 0 when complete or no unindexed levels found

### OCR Mode
Processes documents with OCR:

```bash
MODE=ocr pnpm run start
```

- Queries Elasticsearch for documents without `ocrStatus` field
- Downloads attachments (max 100MB) from comprima-adapter
- Sends to cfn-ocr service with config (language, DPI)
- Stores results in separate Elasticsearch fields:
  - `ocrContent` - Full text extraction
  - `ocrDescription` - Image descriptions (concatenated from pages)
  - `ocrMetadata` - JSON with page-level details
  - `ocrStatus` - 'success', 'error', 'too_large', or 'skip'
- Continues until no more documents to process

**Supported formats**: PDF, JPEG, PNG, GIF, TIFF, WebP

## Configuration

Uses `@iteam/config` with environment variables:

### Required Environment Variables

**Mode Selection**:
- `MODE` - 'index' or 'ocr' (default: 'index')

**Comprima Adapter**:
- `COMPRIMA_URL` - URL to comprima-adapter service (default: http://localhost:4000)

**Elasticsearch**:
- `ELASTIC_SEARCH__URL` - Elasticsearch URL (default: http://localhost:9200)
- Indexing uses `comprima` index

**PostgreSQL** (for index mode):
- `POSTGRES__HOST` - Database host (default: 127.0.0.1)
- `POSTGRES__USER` - Database user (default: postgres)
- `POSTGRES__PASSWORD` - Database password (default: postgres)
- `POSTGRES__PORT` - Database port (default: 5433)
- `DATABASE_URL` - Alternative connection string (used in CI/production)

**OCR Configuration** (for ocr mode):
- `OCR_API_URL` - cfn-ocr service endpoint (default: http://localhost:8000)
- `OCR__BATCH_SIZE` - Number of documents to process per batch (default: 1)
- `OCR__DESCRIPTION_LANGUAGE` - Language for image descriptions (default: 'sv' for Swedish)
- `OCR__DPI` - DPI setting for OCR (default: 200)

**Other**:
- `ATTEMPTS` - Max retry attempts for failed levels (default: 10)
- `LOG_LEVEL` - Logging level (default: 'info')
- `NODE_ENV` - Environment (development/ci/production)

### Configuration File
Supports `config.json` in `src/` directory for local overrides.

## cfn-ocr API Integration

The crawler uses the **cfn-ocr** service for OCR processing. See the [cfn-ocr repository](https://github.com/cfn/cfn-ocr) for full API documentation.

### Endpoint Used
- `POST /ocr` - Synchronous processing (file upload via multipart form data)

### Request Parameters
Sent as `config_json` in the form data:
| Parameter | Used | Description |
|-----------|------|-------------|
| `description_language` | ✅ | Language for AI-generated descriptions (default: "sv") |
| `dpi` | ✅ | PDF rendering DPI (default: 200) |
| `page_start` | ❌ | Start page for partial processing (available but not used) |
| `page_end` | ❌ | End page for partial processing (available but not used) |

### Response Field Mapping
The cfn-ocr response is mapped to Elasticsearch fields:

| cfn-ocr response | Elasticsearch field | Description |
|------------------|---------------------|-------------|
| `document.full_text` | `ocrContent` | Concatenated text from all pages |
| `document.pages[].image_description` | `ocrDescription` | AI descriptions joined with newlines |
| Structured metadata | `ocrMetadata` | JSON with filename, mime_type, page_count, pages |
| (processing result) | `ocrStatus` | 'success', 'error', 'too_large', or 'skip' |

### Available but Unused Endpoints
cfn-ocr also provides async job processing (useful for large documents):
- `POST /ocr/jobs` - Submit async job
- `GET /ocr/jobs/{id}` - Poll job status
- `GET /ocr/jobs/{id}/result` - Fetch completed results

## Database Migrations

Using Knex.js for schema management:

```bash
pnpm run migrate:up    # Apply migrations
pnpm run migrate:down  # Rollback last migration
```

**Migration files**: `migrations/*.js`

**Schema**:
- `levels` table - Tracks Comprima hierarchy levels and crawl status
- Configured per environment in `knexfile.js`

## Testing

**Framework**: Jest with ts-jest
**Config**: `jest.config.js`

```bash
pnpm run test          # Run all tests
pnpm run test:watch    # Watch mode
```

Tests are located in `src/services/*/tests/*.test.ts`

## Production Operations

### Kubernetes CronJob

The crawler runs as a CronJob in Kubernetes. Multiple completed pods are kept for log inspection.

**List pods** (recent runs):
```bash
kubectl -n ci get pods  # or -n production
```

**Get logs from a specific run**:
```bash
kubectl -n ci logs comprima-crawler-27991920-72695
```

**List running jobs**:
```bash
kubectl -n ci get job
```

**Stop a running job**:
```bash
kubectl -n ci delete job comprima-crawler-27992280
```

### Database Access (Production)

**Elasticsearch** (port-forward to avoid default port):
```bash
kubectl -n elasticsearch port-forward elasticsearch-master-0 19200:9200
# Access at http://localhost:19200/_cat/indices?v
```

**PostgreSQL** (port-forward to avoid default port):
```bash
kubectl -n postgres port-forward postgres-postgresql-0 15432:5432
# Connect to localhost:15432 with credentials from Bitwarden
```

⚠️ **Warning**: Using non-default ports prevents accidentally running migrations/seeds against production.

## Recent Changes (OCR Migration)

**Commits**: 79745e2, 65a1f25

**What Changed**:
- Replaced Tesseract OCR with cfn-ocr service (external HTTP service using Qwen3-VL model)
- Migrated from single `ocrText` field to separate fields:
  - `ocrContent` (full text)
  - `ocrDescription` (image descriptions)
  - `ocrMetadata` (structured JSON)
  - `ocrStatus` (processing status)
- Improved error handling with status tracking
- Added support for image descriptions alongside text extraction
- Changed from in-process OCR to external API calls using FormData

**Key Files Changed**:
- `src/services/ocrService/index.ts` - Complete rewrite for API integration
- `src/common/config.ts` - Added OCR configuration options

## Important Patterns

### Error Handling
- OCR failures are marked with `ocrStatus: 'error'` in Elasticsearch
- Large files (>100MB) are marked with `ocrStatus: 'too_large'`
- Index mode throws 'NO_UNINDEXED_LEVELS' error when complete (caught and exits cleanly)

### Retry Logic
- Index mode tracks retry attempts in PostgreSQL `levels.attempts` field
- Configurable max attempts via `ATTEMPTS` env var

### Startup Delay
- Index mode waits 120 seconds on startup to allow comprima-adapter to initialize
- This is for cases where services start simultaneously

### Batch Processing
- OCR mode processes documents in batches (size configurable)
- 1-second delay between batches to allow Elasticsearch to complete writes
- Continues looping until no more documents found
