import axios from 'axios';
import config from '../../common/config';
import log from '../../common/log';
import { indexLevel } from '../comprimaService';
import { getUnindexedLevel, updateLevel } from '../postgresAdapter';
import { Level } from '../../common/types';

const NETWORK_ERROR_CODES = ['ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT'];

const isNetworkError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && !!error.code && NETWORK_ERROR_CODES.includes(error.code);
};

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

  if (!isNetworkError(error)) {
    level.attempts++;
  }

  level.error = JSON.parse(JSON.stringify(error));
  await updateLevel(level);
};

export const crawlLevels = async (): Promise<boolean> => {
  let level;

  do {
    try {
      level = await getUnindexedLevel();
    } catch {
      log.warn('No unindexed levels found');
      return true;
    }

    log.info(`Crawling level`, level);

    try {
      while (!(await processBatch(level)));
    } catch (error) {
      await handleError(level, error);
    }
  } while (level);

  return true;
};
