import { indexSearch } from './services/comprimaService/index';
import { from, mergeMap } from 'rxjs';
import { retry } from 'rxjs/operators';
import config from './common/config';
import log from './common/log';

log.info('Comprima Crawler', config);

// TODO: Check mode - either crawl unindexed levels or reindex updated levels (or ids?).

/*
 * Setup levels.
 */
const levels: number[] = [];

// TODO: Get levels to process from postgres.

const ranges = config.levels.split(',');
ranges.forEach(range => {
  log.info('Parse range', range)

  const extremes = range.split('-');
  const start = parseInt(extremes[0], 10);
  const end = parseInt(extremes[1], 10);
  for (let i = start; i <= end; i++) {
    levels.push(i);
  }
});

/*
 * Crawl.
 */
log.info('Configured levels', levels)

const crawlerStream = from(levels).pipe(
  // TODO: Send levels as an array to indexSearch
  mergeMap(level => indexSearch(level.toString()).then(result => {
    log.info(`✅ Level ${level}`, result)
    return result
  }).catch(error => {
    log.error(`Crawler was unable to process level ${level}!`)
    return error
  }), config.crawler.concurrency),
  retry({count: config.crawler.retryCount, delay: config.crawler.retryDelay * 1000})
  // TODO: What happens when retry counts are exhausted?
)

/*
 * Start the crawler.
 */
crawlerStream.subscribe()
