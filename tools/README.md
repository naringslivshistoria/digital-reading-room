# Tools

You need `jq` to run these tests.

```shell
brew install jq
```

## Generate a token

The bash script `token.bash` can be used to generate a token + salt.

Parameters:

- password

```shell
bash token.bash password
```

## Login + Search

The bash script `test.bash` can be used to login and perform a search.

Parameters:

- username
- password
- search query

```shell
# Do a test search
bash test.bash username password *hennes*
```
