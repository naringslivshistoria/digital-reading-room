#!/bin/bash

PASSWORD=$1

RESULT=$(curl -s -X GET -H "Content-Type: application/json" https://search.dev.cfn.iteam.se/auth/generateHash?password=$1)

echo "Hash: $(echo $RESULT | jq -r '.password')"
echo "Salt: $(echo $RESULT | jq -r '.salt')"
