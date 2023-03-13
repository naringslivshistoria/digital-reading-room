import { indexSearch } from './services/indexSearch';
import { from, map, mergeMap, retryWhen, tap } from 'rxjs';
import { delay, retry } from 'rxjs/operators';
import config from './common/config';
import log from './common/log';

log.info('Comprima Crawler', config);

/*
 * Setup levels.
 */
const levels: number[] = [];

const ranges = config.levels.split(',');
ranges.forEach(range => {
  log.info('Parse range', range)

  const extremes = range.split('-');
  const start = parseInt(extremes[0], 10);
  const end = parseInt(extremes[1], 10);
  for (let i = start; i < end; i++) {
    levels.push(i);
  }
});

log.info('Levels', levels)

/*
 * Crawl.
 */
const crawlerStream = from(levels).pipe(
  mergeMap(level => indexSearch(level.toString()).then(result => {
    log.info(`Result (level ${level}):`, result)
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
