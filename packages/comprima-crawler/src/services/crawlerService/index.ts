import log from '../../common/log';
import config from '../../common/config';
import { indexLevel } from '../comprimaService';
import { getUnindexedLevel, updateLevel } from '../postgresAdapter';
import { Level } from '../../common/types';

const processBatch = async (level: Level): Promise<boolean> => {
  const { result } = await indexLevel(level.level, level.position, config.maxResults);
  const batchCount = result.successful + result.failed;

  level.position += batchCount;
  level.successful += result.successful;
  level.failed += result.failed;
  level.error = null;

  const isComplete = batchCount < config.maxResults;
  if (isComplete) {
    level.crawled = new Date();
    level.position = 0;
    level.attempts++;
  }

  await updateLevel(level);

  return isComplete;
};

const handleError = async (level: Level, error: unknown) => {
  log.error(`Crawling level ${level.level} failed at position ${level.position}`);

  level.error = JSON.parse(JSON.stringify(error));

  const errorString = JSON.stringify(error);
  const isNetworkError =
    errorString.includes('ECONNREFUSED') ||
    errorString.includes('ECONNRESET') ||
    errorString.includes('ENOTFOUND') ||
    errorString.includes('ETIMEDOUT');

  if (!isNetworkError) {
    level.attempts++;
  }

  await updateLevel(level);
};

export const crawlLevels = async () => {
  let level;

  do {
    try {
      level = await getUnindexedLevel();
    } catch (error) {
      log.warn(`No unindexed levels found!`);
      return Promise.resolve(true);
    }

    log.info(`Crawling level ${level.level} from position ${level.position}`);

    let isComplete = false;
    while (!isComplete) {
      try {
        isComplete = await processBatch(level);

        if (isComplete) {
          log.info(`✅ Level ${level.level} completed`, level);
        } else {
          log.info(`Processed batch for level ${level.level}, position now at ${level.position}`);
        }
      } catch (error) {
        await handleError(level, error);
        break;
      }
    }
  } while (level);

  // TODO: Figure out if we should return something more meaningful here.
  return Promise.resolve(true);
};
