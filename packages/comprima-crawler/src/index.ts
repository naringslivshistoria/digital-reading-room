import config from './common/config';
import log from './common/log';
import { crawlLevels } from './services/crawlerService';

log.info('🐛 Comprima Crawler running!');
log.info('Configuration', config);

switch (config.mode) {
  case 'index':
    crawlLevels()
    .then(result => log.info(`Crawl complete: ${result}`))
    .catch(error => {
      if (error === 'NO_UNINDEXED_LEVELS') {
        log.info('No unindexed levels found. Exiting.')
      }
    })
    break;
  // TODO: implement update mode
  // case 'update':
  //   levelPromise = getUpdatedLevels
  //   break;
  default:
    log.warn(`CRAWLER_MODE must be either 'index' or 'update'`)
    log.error(`Unknown mode ${config.mode}!`)
    throw new Error(`Unknown mode ${config.mode}!`)
}
