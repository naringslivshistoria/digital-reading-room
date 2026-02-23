# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**comprima-adapter** is a REST API gateway that provides HTTP access to the Comprima document management system's SOAP API. It handles document retrieval, indexing into Elasticsearch, and thumbnail management.

This service acts as the intermediary between:
- **Comprima** (SOAP-based document management system)
- **Elasticsearch** (document storage and search)
- **Other services** (comprima-crawler, reading-room-search)

**Port**: 4000
**Entry Point**: `src/index.ts`

## Architecture

```
Comprima Adapter (Port 4000)
├── SOAP Client → Comprima System
├── Elasticsearch Client → Document Indexing
└── REST API → External Services
    ├── /index/:documentId - Index single document
    ├── /indexlevel?level=X - Index all documents in a level
    ├── /documents?level=X - Retrieve documents without indexing
    ├── /document/:id - Get document metadata
    └── /document/:id/attachment - Stream document attachment
```

**Data Flow**:
1. Receives HTTP requests from clients (crawler, search API)
2. Authenticates with Comprima SOAP API (session management)
3. Fetches documents/attachments from Comprima
4. Optionally indexes to Elasticsearch with thumbnails
5. Returns data to client

## Code Structure

```
src/
├── app.ts                          # Koa application setup with middleware
├── index.ts                        # Server entry point (port 4000)
├── api.ts                          # Route definitions
├── common/
│   └── types.ts                    # TypeScript interfaces (Document, Field, Page)
├── middlewares/
│   └── error-handler.ts            # Global error handling middleware
└── services/
    ├── comprimaService/
    │   ├── index.ts                # Public API (search, healthCheck, getDocument)
    │   ├── comprimaAdapter.ts      # SOAP client implementation
    │   └── transformer.ts          # XML → Document transformation
    └── indexingService/
        └── index.ts                # Elasticsearch indexing + thumbnail management
```

## Development Commands

```bash
pnpm install              # Install dependencies
pnpm run dev              # Run with auto-reload (nodemon)
pnpm run start            # Start server with ts-node
pnpm run test             # Run Jest tests
pnpm run test:watch       # Jest watch mode
pnpm run lint             # ESLint
```

**Running the service**:
```bash
cd packages/comprima-adapter
pnpm run dev              # Development mode with auto-reload
```

The service will start on http://localhost:4000

## API Endpoints

### Health Check
```
GET /healthz
```
Returns status of Comprima SOAP connection and Elasticsearch connection.

**Response**: `{ comprima: 'OK', elasticSearch: 'OK' }`

---

### Index Single Document
```
GET /index/:documentId
```
Fetches a document from Comprima and indexes it into Elasticsearch.

**Parameters**:
- `documentId` (path) - Comprima document ID

**Response**: `{ result: 'success' }`

---

### Index Level (Batch)
```
GET /indexlevel?level=X&skip=0
```
Fetches all documents in a Comprima hierarchy level and indexes them sequentially (not concurrent to avoid memory issues).

**Parameters**:
- `level` (query, required) - Comprima level identifier
- `skip` (query, optional) - Number of documents to skip (pagination)

**Response**: `{ result: { successful: N, failed: M } }`

**Important**: Documents are indexed sequentially, not with `Promise.all`, to prevent memory exhaustion on large levels.

---

### Get Documents (No Indexing)
```
GET /documents?level=X
```
Retrieves all documents in a level from Comprima without indexing to Elasticsearch. Used by comprima-crawler for discovery.

**Parameters**:
- `level` (query, required) - Comprima level identifier

**Response**: `{ numResults: N, results: [Document...] }`

---

### Get Document Metadata
```
GET /document/:documentId
```
Fetches document metadata from Comprima (fields, pages, etc.).

**Parameters**:
- `documentId` (path) - Comprima document ID

**Response**: Document object

---

### Get Document Attachment
```
GET /document/:documentId/attachment
```
Streams the document's attachment file (PDF, image, etc.) from Comprima.

**Parameters**:
- `documentId` (path) - Comprima document ID

**Response**: Binary stream with appropriate `Content-Type` header

**Used by**: OCR service to download attachments for processing

## Configuration

Uses environment variables for configuration:

### Required Environment Variables

**Comprima SOAP API**:
- `COMPRIMA_SERVICE_URL` - Comprima SOAP service URL
- `COMPRIMA_USER` - Comprima API username
- `COMPRIMA_PASSWORD` - Comprima API password

**Elasticsearch**:
- `ELASTICSEARCH_URL` - Elasticsearch node URL (default: `http://localhost:9200`)
- `ELASTIC_SEARCH__INDEX_NAME` - Index name for documents (default: `comprima`)

**Thumbnail Management**:
- `THUMBNAIL_MAX_SIZE_MB` - Max thumbnail file size to download (default: 20MB)
  - Prevents downloading large video files

### Configuration File
Supports `config.json` in `src/` directory for local overrides (via dotenv).

## Key Services

### comprimaService

**Purpose**: SOAP communication with Comprima system

**Key Functions**:
- `healthCheck()` - Verifies Comprima connection
- `search(level, skip?)` - Retrieves all documents in a level (paginated batches of 10)
- `getDocument(documentId)` - Fetches single document metadata

**Implementation Details**:
- Session-based authentication with automatic login/relogin
- XML parsing using `fast-xml-parser`
- SOAP requests via `easy-soap-request`
- Retry logic with `axios-retry` (3 retries)
- 5-minute timeout for SOAP requests
- Transforms Comprima XML responses into typed Document objects

**comprimaAdapter.ts**:
- Manages SOAP session lifecycle (login, session expiry detection)
- Handles concurrent requests with shared session (waits for login if in progress)
- Auto-relogin on session expiration errors
- Supports attachment streaming with configurable size limits

---

### indexingService

**Purpose**: Elasticsearch indexing and thumbnail management

**Key Functions**:
- `healthCheck()` - Verifies Elasticsearch connection
- `indexDocument(document)` - Indexes document with thumbnail handling

**Thumbnail Processing**:
1. Downloads thumbnail from `document.pages[0].thumbnailUrl`
2. Validates content type (JPEG, PNG, GIF, WebP, etc.)
3. Saves to filesystem: `../thumbnails/{first3digits}/{documentId}.jpg`
4. Enforces max size (20MB) to avoid videos
5. Removes `thumbnailUrl` from document if download fails

**Storage Pattern**:
- Thumbnails organized by first 3 digits of document ID
- Example: Document `2203920` → `../thumbnails/220/2203920.jpg`

**Elasticsearch**:
- Uses `@elastic/elasticsearch` client
- Document ID becomes Elasticsearch document ID
- Target index from `ELASTIC_SEARCH__INDEX_NAME` env var

## Testing

**Framework**: Jest with ts-jest
**Config**: `jest.config.js`

```bash
pnpm run test          # Run all tests
pnpm run test:watch    # Watch mode
```

**Test files**: Located alongside source files (e.g., `error-handler.test.ts`)

**Testing patterns**:
- Use `supertest` for API endpoint testing
- Mock SOAP responses for comprima service tests
- Mock Elasticsearch client for indexing tests

## Important Patterns

### SOAP Session Management

The adapter manages a single shared SOAP session across all requests:

```typescript
let sessionId: string | undefined
let loginInProgress = false
```

**Key behaviors**:
- Login on first request
- Concurrent requests wait for login completion (5s polling)
- Auto-relogin on session expiration (detected from SOAP errors)
- Session reuse across all subsequent requests

---

### Error Handling

Global error handler middleware catches all unhandled errors:

**Middleware**: `src/middlewares/error-handler.ts`

Returns standardized error responses and logs errors to console.

---

### Batch Processing Strategy

When indexing levels (`/indexlevel`), documents are processed **sequentially**:

```typescript
// Do not Promise.all this as concurrent indexing of many documents
// will use a lot of memory.
for (const document of results) {
  await index.indexDocument(document)
}
```

**Reason**: Concurrent indexing of many documents causes memory issues with thumbnails and Elasticsearch bulk operations.

---

### Thumbnail Size Limits

Max attachment size enforced to prevent downloading video files:

```typescript
const maxContentLength = 20 * 1_000_000 // 20MB default
```

**Behavior**:
- Downloads that exceed limit are aborted
- Document still indexed but without thumbnail
- Error logged but indexing continues

---

### XML Transformation

Comprima SOAP responses are transformed from XML to typed TypeScript objects:

**transformer.ts**: Converts Comprima field structure to normalized Document type

**Key transformations**:
- Field name mapping (Comprima IDs → readable names)
- Page URL extraction
- Thumbnail URL extraction
- Document state parsing

## Production Considerations

### Memory Management

- Sequential indexing prevents memory spikes on large levels
- Thumbnail size limits prevent OOM from large files
- Batch size of 10 documents per Comprima request balances throughput and memory

### Reliability

- SOAP session auto-recovery (relogin on expiration)
- Retry logic for transient failures (3 retries)
- Long timeouts (5 minutes) for large document operations
- Graceful degradation (thumbnails optional)

### Performance

- Thumbnail downloads have 60-second timeout
- Streaming response for attachments (no buffering in memory)
- Batch retrieval of documents (10 at a time)
- Elasticsearch bulk operations

## Dependencies

**Core**:
- `koa` - Web framework
- `@koa/router` - Routing
- `koa-bodyparser` - Request body parsing

**Comprima Integration**:
- `easy-soap-request` - SOAP client
- `fast-xml-parser` - XML parsing
- `axios` - HTTP client for attachments
- `axios-retry` - Automatic retry logic

**Elasticsearch**:
- `@elastic/elasticsearch` - Official Elasticsearch client

**Development**:
- `typescript` - Type safety
- `ts-node` - TypeScript execution
- `nodemon` - Auto-reload
- `jest` - Testing
- `supertest` - API testing

## Common Issues

### Session Expiration
**Symptom**: SOAP requests start failing after period of inactivity
**Solution**: Automatic relogin handled by `ensureLogin()` function

### Memory Issues on Large Levels
**Symptom**: Process crashes when indexing levels with many documents
**Solution**: Sequential processing is already implemented (do not change to `Promise.all`)

### Thumbnail Download Failures
**Symptom**: Many thumbnails fail to download
**Solution**:
- Check `THUMBNAIL_MAX_SIZE_MB` setting
- Verify thumbnail URLs are accessible
- Document still gets indexed without thumbnail (graceful degradation)

### Elasticsearch Connection
**Symptom**: Indexing fails with connection errors
**Solution**:
- Verify `ELASTICSEARCH_URL` is correct
- Check Elasticsearch is running and accessible
- Use `/healthz` endpoint to diagnose

## Integration Points

**Used by**:
- `comprima-crawler` (index mode) - Calls `/documents` and `/index/:id`
- `comprima-crawler` (ocr mode) - Calls `/document/:id/attachment`
- Manual indexing operations

**Depends on**:
- Comprima SOAP API (external system)
- Elasticsearch cluster (document storage)
- File system (thumbnail storage)
