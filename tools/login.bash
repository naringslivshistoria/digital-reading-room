#!/bin/bash

curl -X POST -H "Content-Type: application/json" -d '{"username":"ilix","password":"meow"}' http://localhost:4001/auth/generate-token
