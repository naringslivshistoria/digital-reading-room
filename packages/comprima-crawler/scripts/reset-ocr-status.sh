#!/bin/bash
# Usage:
# Against local Elasticsearch
# ./scripts/reset-ocr-status.sh <level-id>

# Against a different host (e.g. port-forwarded production)
# ./scripts/reset-ocr-status.sh <level-id> localhost:19200

set -euo pipefail

LEVEL_ID="${1:-}"
ES_URL="${2:-localhost:9200}"
INDEX="comprima"

if [ -z "$LEVEL_ID" ]; then
  echo "Usage: $0 <level-id> [elasticsearch-url]"
  echo "  level-id          The Comprima level ID to target"
  echo "  elasticsearch-url Defaults to localhost:9200"
  exit 1
fi

echo "Removing ocrStatus from all documents with level=$LEVEL_ID in index $INDEX at $ES_URL..."

RESPONSE=$(curl -s -X POST "$ES_URL/$INDEX/_update_by_query" \
  -H 'Content-Type: application/json' \
  -d "{
    \"query\": {
      \"term\": { \"level\": \"$LEVEL_ID\" }
    },
    \"script\": {
      \"source\": \"ctx._source.remove('ocrStatus')\",
      \"lang\": \"painless\"
    }
  }")

echo "$RESPONSE" | python3 -c "
import json, sys
r = json.load(sys.stdin)
print(f\"Updated: {r.get('updated', 0)}, Failures: {len(r.get('failures', []))}, Total: {r.get('total', 0)}\")
if r.get('failures'):
    print('Failures:', json.dumps(r['failures'], indent=2))
" 2>/dev/null || echo "$RESPONSE"
