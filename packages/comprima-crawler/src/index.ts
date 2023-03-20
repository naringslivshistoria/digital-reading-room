import { getUnindexedLevels } from './services/postgresAdapter/index';
import config from './common/config';
import log from './common/log';
import { crawlLevels } from './services/crawlerService';

log.info('Comprima Crawler', config);

// TODO: Check mode - either crawl unindexed levels or reindex updated levels (or ids?).
const mode = config.mode;

let levelPromise
switch (config.mode) {
  case 'index':
    levelPromise = getUnindexedLevels
    break;
  // case 'update':
  //   levelPromise = getUpdatedLevels
  //   break;
  default:
    log.warn(`CRAWLER_MODE must be either 'index' or 'update'`)
    log.error(`Unknown mode ${mode}!`)
    throw new Error(`Unknown mode ${mode}!`)
}

/*
 * Setup levels.
 */
levelPromise().then(levels => {
  return crawlLevels(levels)
})
.then(result => log.info(`Crawl complete: ${result}`))
.catch(error => log.error('Crawl failed!', error))
