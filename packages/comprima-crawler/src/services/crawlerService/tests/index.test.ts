import { AxiosError } from 'axios';
import * as comprimaService from '../../comprimaService';
import * as postgresAdapter from '../../postgresAdapter';
import { Level } from '../../../common/types';
import { crawlLevels } from '..';

const createAxiosError = (code: string): AxiosError => {
  const error = new AxiosError(`Network error: ${code}`);
  error.code = code;
  return error;
};

jest.mock('knex');
jest.mock('../../../common/config', () => {
  return {
    __esModule: true,
    default: {
      logLevel: 'SILENT',
      postgres: {},
      maxResults: 100,
    },
  };
});

describe('crawler', () => {
  describe('crawlLevels', () => {
    const level = {
      level: 41000,
      position: 0,
      failed: 0,
      successful: 0,
    } as Level;

    afterEach(() => {
      jest.clearAllMocks();
    });

    beforeEach(() => {
      jest.spyOn(postgresAdapter, 'updateLevel').mockResolvedValue(true);
    });

    it('calls comprima service with correct levels', async () => {
      jest
        .spyOn(comprimaService, 'indexLevel')
        .mockResolvedValue({ result: { successful: 0, failed: 0 } });

      jest
        .spyOn(postgresAdapter, 'getUnindexedLevel')
        .mockResolvedValueOnce(level)
        .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');

      await crawlLevels();
      expect(comprimaService.indexLevel).toBeCalledWith(level.level, 0, 100);
    });

    it('clears error field if level is crawled successfully', async () => {
      level.error = { message: 'Some error' };

      jest
        .spyOn(comprimaService, 'indexLevel')
        .mockResolvedValue({ result: { successful: 0, failed: 0 } });

      jest
        .spyOn(postgresAdapter, 'getUnindexedLevel')
        .mockResolvedValueOnce(level)
        .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');

      await crawlLevels();
      expect(postgresAdapter.updateLevel).toBeCalledWith(
        expect.objectContaining({ error: null })
      );
    });

    describe('increases crawl attempts', () => {
      beforeEach(() => {
        level.attempts = 5;
      });

      it('after a successful crawl', async () => {
        jest
          .spyOn(comprimaService, 'indexLevel')
          .mockResolvedValue({ result: { successful: 0, failed: 0 } });

        jest
          .spyOn(postgresAdapter, 'getUnindexedLevel')
          .mockResolvedValueOnce(level)
          .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');

        await crawlLevels();
        expect(comprimaService.indexLevel).toBeCalledWith(level.level, 0, 100);
        expect(postgresAdapter.updateLevel).toBeCalledWith(
          expect.objectContaining({ attempts: 6 })
        );
      });

      it('after a failed crawl', async () => {
        jest
          .spyOn(comprimaService, 'indexLevel')
          .mockRejectedValueOnce(new Error('Some error'));

        jest
          .spyOn(postgresAdapter, 'getUnindexedLevel')
          .mockResolvedValueOnce(level)
          .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');

        await crawlLevels();
        expect(comprimaService.indexLevel).toBeCalledWith(level.level, 0, 100);
        expect(postgresAdapter.updateLevel).toBeCalledWith(
          expect.objectContaining({ attempts: 6 })
        );
      });
    });

    describe('does not increase crawl attempts', () => {
      beforeEach(() => {
        level.attempts = 5;
      });

      describe('when the comprima-adapter connection fails due to', () => {
        it('ECONNREFUSED', async () => {
          jest
            .spyOn(comprimaService, 'indexLevel')
            .mockRejectedValueOnce(createAxiosError('ECONNREFUSED'));

          jest
            .spyOn(postgresAdapter, 'getUnindexedLevel')
            .mockResolvedValueOnce(level)
            .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');

          await crawlLevels();
          expect(comprimaService.indexLevel).toBeCalledWith(level.level, 0, 100);
          expect(postgresAdapter.updateLevel).toBeCalledWith(
            expect.objectContaining({ attempts: 5 })
          );
        });

        it('ECONNRESET', async () => {
          jest
            .spyOn(comprimaService, 'indexLevel')
            .mockRejectedValueOnce(createAxiosError('ECONNRESET'));

          jest
            .spyOn(postgresAdapter, 'getUnindexedLevel')
            .mockResolvedValueOnce(level)
            .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');

          await crawlLevels();
          expect(comprimaService.indexLevel).toBeCalledWith(level.level, 0, 100);
          expect(postgresAdapter.updateLevel).toBeCalledWith(
            expect.objectContaining({ attempts: 5 })
          );
        });

        it('ENOTFOUND', async () => {
          jest
            .spyOn(comprimaService, 'indexLevel')
            .mockRejectedValueOnce(createAxiosError('ENOTFOUND'));

          jest
            .spyOn(postgresAdapter, 'getUnindexedLevel')
            .mockResolvedValueOnce(level)
            .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');

          await crawlLevels();
          expect(comprimaService.indexLevel).toBeCalledWith(level.level, 0, 100);
          expect(postgresAdapter.updateLevel).toBeCalledWith(
            expect.objectContaining({ attempts: 5 })
          );
        });

        it('ETIMEDOUT', async () => {
          jest
            .spyOn(comprimaService, 'indexLevel')
            .mockRejectedValueOnce(createAxiosError('ETIMEDOUT'));

          jest
            .spyOn(postgresAdapter, 'getUnindexedLevel')
            .mockResolvedValueOnce(level)
            .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');

          await crawlLevels();
          expect(comprimaService.indexLevel).toBeCalledWith(level.level, 0, 100);
          expect(postgresAdapter.updateLevel).toBeCalledWith(
            expect.objectContaining({ attempts: 5 })
          );
        });
      });
    });
  });
});
