import { from, mergeMap } from 'rxjs';
import { retry } from 'rxjs/operators';
import { indexSearch } from './services/comprimaService/index';
import { getUnindexedLevels } from './services/postgresAdapter/index';
import config from './common/config';
import log from './common/log';

log.info('Comprima Crawler', config);

// TODO: Check mode - either crawl unindexed levels or reindex updated levels (or ids?).

/*
 * Setup levels.
 */
getUnindexedLevels(config.crawler.concurrency).then(levels => {
  log.info('Unindexed levels', levels)

  /*
  * Crawl.
  */
  log.info('Configured levels', levels)

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

