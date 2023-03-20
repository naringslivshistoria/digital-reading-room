import config from "../../common/config"
import log from "../../common/log"
import { getSubRange } from "../../helpers/arrayHelper"
import { indexSearch } from "../comprimaService"

export interface Range {
  lower: number
  upper: number
}

export const crawlLevels = async (range: Range): Promise<boolean> => {
  // TODO: Mark range as in progress in postgres

  const cursor = {
    lower: range.lower,
    upper: range.upper + config.crawler.batchSize
  }
  // TODO: Crawl 10 at a time
  do {
    cursor.upper += config.crawler.batchSize
    const levels = getSubRange(cursor.lower, range.upper, config.crawler.batchSize)

    log.info(`Crawling levels`, cursor)
    log.debug('Levels', levels)
    try {
      const result = await indexSearch(levels)
      log.info(`✅ Levels ${cursor.lower}–${cursor.upper}`, result)
    } catch (error) {
      log.error(`Crawler was unable to process levels ${cursor.lower}–${cursor.upper}!`)
    }

    cursor.lower += config.crawler.batchSize
  } while (cursor.lower <= range.upper)

  // TODO: Figure out if we should return something more meaningful here.
  return Promise.resolve(true)
}
