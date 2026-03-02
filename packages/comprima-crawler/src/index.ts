/* eslint-disable no-process-exit */
import config from './common/config'
import log from './common/log'
import { crawlLevels } from './services/crawlerService'
import { ocrNext } from './services/ocrService'

log.info('🐛 Comprima Crawler running!')
log.info('Configuration', config)

const delay = async (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

let documentId = null

;(async () => {
  log.info(
    'Delaying startup 1,2s for comprima adapter to initialize (if it was started simultaneously)'
  )

  switch (config.mode) {
    case 'index':
      await delay(120 * 10)
      log.info('Delay complete, resuming normal startup')

      crawlLevels()
        .then(() => {
          log.info(`Crawl complete!`)
          process.exit(0)
        })
        .catch((error) => {
          if (error === 'NO_UNINDEXED_LEVELS') {
            log.info('No unindexed levels found. Exiting.')
            process.exit(0)
          }

          log.error('Crawl failed', error)
          process.exit(1)
        })
      break
    case 'ocr':
      do {
        documentId = await ocrNext()
        log.info(`Successfully OCR:ed ${documentId}`)
        // Stupid wait for elastic to be done writing not to pick
        // up duplicates
        await delay(1000)
      } while (documentId != null)

      break
    default:
      log.warn(`MODE must be 'index' or 'ocr'`)
      log.error(`Unknown mode ${config.mode}!`)
      throw new Error(`Unknown mode ${config.mode}!`)
  }
})()
