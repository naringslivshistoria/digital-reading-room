import config from "../../common/config"
import log from "../../common/log"
import { getSubRange } from "../../helpers/arrayHelper"
import { indexSearch } from "../comprimaService"
import { getUnindexedLevels, Level } from "../postgresAdapter"

export const crawlLevels = async () => {
  // TODO: Mark range as in progress in postgres
  let level

  do {
    // const levels = getSubRange(levelCursor, range.upper, config.batchSize)
    
    level = getUnindexedLevels()

    const levelsLabel = `${levels[0]}–${levels[levels.length - 1]}`
    log.info(`Crawling levels ${levelsLabel}`, levels)
    
    try {
      const result = await indexSearch(levels)

      // TODO: Mark levels as indexed in postgres
      log.info(`✅ Levels ${levelsLabel}`, result)
    } catch (error: any) {
      log.warn('a', error)
      log.error(`Crawler was unable to process levels ${levelsLabel}!`)

      // TODO: Save error in postgres
    }
    
    levelCursor += config.batchSize
  } while (level)

  // TODO: Figure out if we should return something more meaningful here.
  return Promise.resolve(true)
}
