import { from, mergeMap } from 'rxjs';
import { retry } from 'rxjs/operators';
import { getUpdatedLevels, indexSearch } from './services/comprimaService/index';
import { getUnindexedLevels } from './services/postgresAdapter/index';
import config from './common/config';
import log from './common/log';

log.info('Comprima Crawler', config);

// TODO: Check mode - either crawl unindexed levels or reindex updated levels (or ids?).
const mode = config.mode;
let levels
switch (config.mode) {
  case 'index':
    levels = getUnindexedLevels(1) // TODO: config.crawler.batchSize
    break;
  case 'update':
    levels = getUpdatedLevels()
    break;
  default:
    log.error(`Unknown mode ${mode}!`)
    log.warn(`CRAWLER_MODE must be either 'index' or 'update'`)
    process.exit(1)
}

/*
 * Setup levels.
 */
levels.then(levels => {
  log.info('Processing levels', levels)

  /*
   * Crawl.
   */
  const crawlerStream = from(levels).pipe(
    // TODO: Send levels as an array to indexSearch
    mergeMap(level => indexSearch(levels).then(result => {
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
});

