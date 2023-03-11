#!/bin/bash

USERNAME=$1
PASSWORD=$2

SEARCH=$3

TOKEN=$(curl -s -X POST -H "Content-Type: application/json" -d '{"username":"'$USERNAME'","password":"'$PASSWORD'"}' https://search.dev.cfn.iteam.se/auth/generate-token | jq -r '.token')

curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" https://search.dev.cfn.iteam.se/search?query=$SEARCH
