import { indexSearch } from './services/indexSearch';
import { from, map, mergeMap, retryWhen, tap } from 'rxjs';
import { delay, retry } from 'rxjs/operators';
import config from './common/config';

console.log('Comprima Crawler');

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
  }), config.concurrency),
  retryWhen((errors) =>
      errors.pipe(
        tap((err) => console.error(`Crawler streams error, retrying in ${config.retryDelay} s...`, err)),
        delay(config.retryDelay * 1000)
      )
    ),
)

/*
 * Start the crawler.
 */
crawlerStream.subscribe()
