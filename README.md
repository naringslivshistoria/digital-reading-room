# Digital Läsesal

## Contributing

### Requirements

You need _Docker_, _Node.js_ and the following tools to work with this project:

```shell
brew install jq kubectl kubectx skaffold

# Optionally, install these to make life easier:
brew install direnv nvm
# ...remember to setup shell hooks for them :)
```

## Quick start

Assuming you are using direnv, create a `.envrc` file in this dir. Then run `docker compose up` to run all of the microservices as well as elasticsearch and kibana.

```
# Template .envrc
export COMPRIMA_PASSWORD=
export COMPRIMA_SERVICE_URL=
export COMPRIMA_USER=
export POSTGRES_PASSWORD=
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

## Test

edit test test
