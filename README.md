# Digital Läsesal

## Contributing

### Requirements

You need _Docker_, _Node.js_ and the following tools to work with this project:

```shell
brew install jq kubectl kubectx skaffold

# Optionally, install these to make life easier:
brew install direnv nvm
# ...remember to setup shell hooks for them :) +1
```

## Quick start

Assuming you are using direnv, create a `.envrc` file in this dir.
Run `docker compose up` to run all of the microservices as well as elasticsearch and kibana.
Run `docker compose up kibana postgres elasticsearch &` to run postgres, elasticsearch and kibana.

```
# Template .envrc
export COMPRIMA_SERVICE_URL=
export COMPRIMA_USER=
export COMPRIMA_PASSWORD=
export COMPRIMA_USER_TEST=
export COMPRIMA_PASSWORD_TEST=
export POSTGRES_USER=
export POSTGRES_PASSWORD=
export COMPRIMA_ADAPTER__URL=
export TESSDATA_PREFIX=
export ELASTIC_PASSWORD=
export KIBANA_PASSWORD=
```

### Configuration

The following environment variables are needed when running locally:

#### reading-room-search

COOKIE_DOMAIN=localhost

#### reading-room-frontend

VITE_COOKIE_DOMAIN=localhost

## Operations

All microservices are hosted with Kubernetes, see the [Operations repo](https://github.com/naringslivshistoria/operations) for more details.

### External dependencies

We use GitHub Actions for ci/cd. Docker images are stored in the [GitHub Container Registry](https://github.com/orgs/naringslivshistoria/packages). If builds/deploys are failing, check [githubstatus.com](https://www.githubstatus.com).

Any server node that hosts the Comprima Adapter microservice needs to be connected to a [VPN](https://github.com/naringslivshistoria/operations/blob/main/VPN.md) to be able to reach Comprima.

## Troubleshooting

### OCR Processing

There is a kibana setup for ci and production respecively. You can run a query to quickly check the status of the OCR processing.

```shell
# Open a tunnel to kibana.
kubectl -n production port-forward services/kibana-kibana 5601 # or -n ci
```

Open [http://localhost:5601](http://localhost:5601) and create the index pattern `comprima` if it does not already exist. Then go to the Discover tab, click `Add filter` and `Edit as Query DSL` to be able to enter JSON queries.

**Find all documents that has the `ocrText` field set.**

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
