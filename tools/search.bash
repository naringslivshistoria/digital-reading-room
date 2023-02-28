#!/bin/bash

CURL -X GET -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NThmNDNiNC0wZWE4LTRkYTgtODJjOS02MDIwZGM1MGYyYTgiLCJ1c2VybmFtZSI6ImlsaXgiLCJpYXQiOjE2Nzc1OTk3NzMsImV4cCI6MTY3NzYxMDU3M30.241NSD4fkNKgwrP20dNGRephgmv5M1zqlLuJyTk7zX4" http://localhost:4001/search?query=*aaa*
