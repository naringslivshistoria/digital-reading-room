#!/usr/bin/env bash
set -euo pipefail

ES_URL="http://localhost:9200"
INDEX="comprima"
BATCH_SIZE=50000

while true; do
 COUNT_JSON=$(curl -sS "$ES_URL/$INDEX/_count" -H 'Content-Type: application/json' -d '{
  "query": {
   "bool": {
    "must_not": [
     { "term": { "ocrStatus": "skip" } }
    ]
   }
  }
 }')

 COUNT=$(echo "$COUNT_JSON" | jq -r '.count // empty')

 if [[ -z "${COUNT}" ]]; then
  echo "Count request failed, response was:"
  echo "$COUNT_JSON"
  exit 1
 fi

 echo "Remaining (not skip): $COUNT"

 if [ "$COUNT" -eq 0 ]; then
  echo "Done!"
  break
 fi

 RESULT=$(curl -sS "$ES_URL/$INDEX/_update_by_query?conflicts=proceed&refresh=true&max_docs=$BATCH_SIZE" \
  -H 'Content-Type: application/json' -d '{
   "script": {
    "source": "ctx._source.ocrStatus = \"skip\"",
    "lang": "painless"
   },
   "query": {
    "bool": {
     "must_not": [
      { "term": { "ocrStatus": "skip" } }
     ]
    }
   }
  }')

 UPDATED=$(echo "$RESULT" | jq -r '.updated // 0')
 echo "Updated: $UPDATED"

 sleep 1
done