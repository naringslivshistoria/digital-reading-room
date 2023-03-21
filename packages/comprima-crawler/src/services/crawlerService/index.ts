import config from "../../common/config"
import log from "../../common/log"
import { getSubRange } from "../../helpers/arrayHelper"
import { indexSearch } from "../comprimaService"
import { getUnindexedLevel, Level, updateLevel } from "../postgresAdapter"

export const crawlLevels = async () => {
  // TODO: Mark range as in progress in postgres
  let level

  do {
    // const levels = getSubRange(levelCursor, range.upper, config.batchSize)
    level = await getUnindexedLevel()

    log.info(`Crawling level`, level)
    
    try {
      const {result} = await indexSearch(level.level)

      level.crawled = new Date()
      level.failed = result.failed
      level.successful = result.successful

      await updateLevel(level)

      log.info(`✅ Levels ${level.level}`, level)
    } catch (error: any) {
      log.error(`Crawling level ${level.level} failed!`)
      level.error = error

      await updateLevel(level)
    }
  } while (level)

  // TODO: Figure out if we should return something more meaningful here.
  return Promise.resolve(true)
}
