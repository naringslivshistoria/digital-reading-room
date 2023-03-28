/* eslint-disable no-process-exit */
import config from './common/config';
import log from './common/log';
import { crawlLevels } from './services/crawlerService';
import { ocrNext } from './services/ocrService'

log.info('🐛 Comprima Crawler running!');
log.info('Configuration', config);

const delay = async (time: number) => {
  return new Promise(resolve => setTimeout(resolve, time))
}

(async () => {
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
    case 'ocr':
      let documentId = null

      do {
        documentId = await ocrNext()
        console.info('Successfully OCR:ed', documentId)
        // Stupid wait for elastic to be done writing not to pick
        // up duplicates
        await delay(1000)
      }
      while (documentId != null)

      break;
    // TODO: implement update mode
    // case 'update':
    //   levelPromise = getUpdatedLevels
    //   break;
    default:
      log.warn(`CRAWLER_MODE must be either 'index', 'update' or 'ocr`);
      log.error(`Unknown mode ${config.mode}!`);
      throw new Error(`Unknown mode ${config.mode}!`);
  }
}) ()
