import { indexSearch } from './services/indexSearch';
import { from, map, mergeMap, retryWhen, tap } from 'rxjs';
import { delay, retry } from 'rxjs/operators';

console.log('Comprima Crawler');

/*
 * Prepare the crawler.
 */
const concurrency = 2; // Number of concurrent requests.
const retryDelay = 1; // Seconds.

const levels: number[] = [];
for (let i = 41080; i > 41000; i--) {
  levels.push(i);
}

console.log('Levels', levels)

/*
 * Crawl.
 */
const crawlerStream = from(levels).pipe(
  mergeMap(level => indexSearch(level.toString()).then(result => {
    console.log(`Result (level ${level}):`, result)
    return result
  }), concurrency),
  retryWhen((errors) =>
      errors.pipe(
        tap((err) => console.error(`Crawler streams error, retrying in ${retryDelay} s...`, err)),
        delay(retryDelay * 1000)
      )
    ),
)

/*
 * Start the crawler.
 */
crawlerStream.subscribe()
