import { indexSearch } from './services/indexSearch';
import { from, mergeMap } from 'rxjs';
import { retry } from 'rxjs/operators';
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
  }).catch(error => {
    log.error(`Crawler error, level ${level}`, level, error)
    return error
  }), config.concurrency),
  retry({count: config.retryCount, delay: config.retryDelay * 1000})
  // TODO: What happens when retry counts are exhausted?
)

/*
 * Start the crawler.
 */
crawlerStream.subscribe()
