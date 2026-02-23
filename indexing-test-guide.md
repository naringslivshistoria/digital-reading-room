Complete Testing Guide

Test 1: Low maxResults (5 documents)

cd packages/comprima-crawler

# Test with only 5 documents per level

MAX_RESULTS=5 COMPRIMA_URL=http://localhost:14000 MODE=index pnpm start

Expected output:
INFO Crawling level { level: 43608, ... }
Successfully retrieved documents 1 to 5 in X ms
✅ Levels 43608 { successful: 5, failed: 0 }

Test 2: Default maxResults (100 documents)

COMPRIMA_URL=http://localhost:14000 MODE=index pnpm start

Expected: Should index up to 100 documents per level.

Test 3: Verify in Elasticsearch

# Count documents indexed

curl "http://localhost:9200/comprima/\_count"

# Get last indexed documents

curl "http://localhost:9200/comprima/\_search?size=10&sort=@timestamp:desc" | jq '.hits.hits[].\_source.documentId'

Test 4: Direct API Test

Test the adapter directly without the crawler:

# Index exactly 3 documents

curl "http://localhost:14000/indexlevel?level=43608&maxResults=3" | jq

Expected response:
{"result":{"successful":3,"failed":0}}

Test 5: Verify Batch Behavior

With the console logs in the adapter, you should see:
Successfully retrieved documents 1 to 10 in X ms
Successfully retrieved documents 11 to 20 in X ms
(stops early when maxResults reached)

---

What to Look For

✅ Success Indicators:

- Crawler logs show successful: N matching your maxResults
- Elasticsearch document count matches expected number
- Adapter logs show it stops fetching after reaching maxResults
- No crashes or memory issues

❌ Potential Issues:

- Documents indexed exceed maxResults (slicing logic broken)
- All documents indexed despite low maxResults (parameter not passed)
- Crashes with very low maxResults (edge case handling)

Try running Test 1 first with MAX_RESULTS=5 - it's the quickest way to verify your changes are working!