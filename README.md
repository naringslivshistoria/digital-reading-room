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
export COMPRIMA_SERVICE_URL_TEST=
export COMPRIMA_USER_TEST=
export COMPRIMA_PASSWORD_TEST=
export COMPRIMA_SERVICE_URL=
export COMPRIMA_USER=
export COMPRIMA_PASSWORD=
export POSTGRES_PASSWORD=
```
