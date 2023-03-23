/* eslint-disable no-process-exit */
import config from './common/config';
import log from './common/log';
import { crawlLevels } from './services/crawlerService';

log.info('🐛 Comprima Crawler running!');
log.info('Configuration', config);

switch (config.mode) {
  case 'index':
    crawlLevels()
      .then(() => {
        log.info(`Crawl complete!`);
        process.exit(0);
      })
      .catch((error) => {
        if (error === 'NO_UNINDEXED_LEVELS') {
          log.info('No unindexed levels found. Exiting.');
          process.exit(0);
        }

        log.error('Crawl failed', error);
        process.exit(1);
      });
    break;
  // TODO: implement update mode
  // case 'update':
  //   levelPromise = getUpdatedLevels
  //   break;
  default:
    log.warn(`CRAWLER_MODE must be either 'index' or 'update'`);
    log.error(`Unknown mode ${config.mode}!`);
    throw new Error(`Unknown mode ${config.mode}!`);
}
