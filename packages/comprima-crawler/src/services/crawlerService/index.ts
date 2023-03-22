import log from '../../common/log';
import { indexLevel } from '../comprimaService';
import { getUnindexedLevel, updateLevel } from '../postgresAdapter';

export const crawlLevels = async () => {
  let level;

  do {
    try {
      level = await getUnindexedLevel();
    } catch (error) {
      log.warn(`No unindexed levels found!`);
      return Promise.resolve(true);
    }
    // TODO: Mark level as in progress in postgres.

    log.info(`Crawling level`, level);

    try {
      const { result } = await indexLevel(level.level);

      level.crawled = new Date();
      level.failed = result.failed;
      level.successful = result.successful;

      await updateLevel(level);

      log.info(`✅ Levels ${level.level}`, level);
    } catch (error: any) {
      log.error(`Crawling level ${level.level} failed!`);
      level.crawled = new Date();
      level.error = error;

      await updateLevel(level);
    }
  } while (level);

  // TODO: Figure out if we should return something more meaningful here.
  return Promise.resolve(true);
};
