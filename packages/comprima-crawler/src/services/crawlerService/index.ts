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

    log.info(`Crawling level`, level);

    try {
      const { result } = await indexLevel(level.level);

      level.crawled = new Date();
      level.failed = result.failed;
      level.successful = result.successful;
      level.error = undefined;

      await updateLevel(level);

      log.info(`✅ Levels ${level.level}`, level);
    } catch (error) {
      log.error(`Crawling level ${level.level} failed!`);
      level.crawled = new Date();
      level.error = JSON.parse(JSON.stringify(error));

      await updateLevel(level);
    }
  } while (level);

  // TODO: Figure out if we should return something more meaningful here.
  return Promise.resolve(true);
};
