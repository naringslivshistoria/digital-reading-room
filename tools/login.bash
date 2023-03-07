#!/bin/bash

curl -X POST -H "Content-Type: application/json" -d '{"username":"dev-team","password":"lm-rummet"}' https://search.dev.cfn.iteam.se/auth/generate-token
