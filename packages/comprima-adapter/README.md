# COMPRIMA-ADAPTER

## Getting started

```shell
mkdir ../thumbnails

npm ci
```

### Prerequisites

You need elasticsearch running on localhost:9200.

```shell
# Create the index.
curl -X PUT http://localhost:9200/comprima-prod-3
```

## Running

```shell
npm run dev
```

## Configuration

Some thumbnails in Cromprima are actually video files, some of them over 1 GB in size. We currently have no need for these "thumbnails" and they are also causing problems, because the comprima-adapter will attempt downloading them entirely (and storing them in RAM) before deciding they are not going to be saved anyway. Therefore we configure Axios with a maxContentLength of 20 MB. This limit is configurable using the `THUMBNAIL_MAX_SIZE_MB` env variable.
