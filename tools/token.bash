#!/bin/bash

curl -X GET -H "Content-Type: application/json" -d '{"query":"scania","levels":41080}' http://localhost:4001/auth/generateHash?password=meow
