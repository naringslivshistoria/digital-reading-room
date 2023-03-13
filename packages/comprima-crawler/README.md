# Cromprima Crawler

This is a background service responsible for discovering items in Comprima and extracting metadata and performing OCR on attachments. Metadata and textual image contents are indexed in Elasticsearch.

## Configuration

```shell
COMPRIMA_URL=http://comprima-adapter-url # URL to comprima adapter
CONCURRENCY=2 # Number of requests to do simultaneously
RETRY_DELAY=1 # Number of seconds before retrying failed request
```

## Installation

`npm run ci`

## Development

`npm run dev`

## Tests

`npm run test`

## Misc

- [Jest](https://jestjs.io/) is used for testing along with [supertest](https://www.npmjs.com/package/supertest)
