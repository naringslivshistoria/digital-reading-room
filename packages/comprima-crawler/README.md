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

## Production status

The crawler runs as a cronjob in kubernetes, as specified in the operations repository. If you list pods you can see a number of pods having names starting with `comprima-crawler-`. Kubernetes maintains pods from the last few runs so that we can fetch their logs if necessary. Those are showed as `Completed` when listing pods.

If you want to remove a running crawler, you have to list jobs and then remove the job that started the pod.

```shell
# List pods
kubectl -n ci get pods # This command will show a couple of 'Completed' pods and perhaps a running one.

# Get logs from a crawler pod
kubectl -n ci logs comprima-crawler-27991920-72695

# List running jobs
kubectl -n ci get job

# Stop a job
kubectl -n ci delete job comprima-crawler-27992280
```

### Inspecting databases

You can access elasticsearch and postgres by tunneling into the cluster. Note: It is smart to avoid mapping these databases to default ports on your end, to avoid accidentally running migrations, seeds or other destructive actions.

#### Elasticsearch

Map elasticsearch to [http://localhost:19200/\_cat/indices?v](http://localhost:19200/_cat/indices?v): `kubectl -n elasticsearch port-forward elasticsearch-master-0 19200:9200`

#### Postgres

Map postgres to port 15432 on localhost: `kubectl -n postgres port-forward postgres-postgresql-0 15432:5432`.

You can find the postgres password in bitwarden. Note that you need different passwords for crawler and readingroom.
