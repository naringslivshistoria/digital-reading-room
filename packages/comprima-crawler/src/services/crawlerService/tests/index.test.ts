import * as comprimaService from '../../comprimaService';
import * as postgresAdapter from '../../postgresAdapter';
import { Level } from '../../../common/types';
import { crawlLevels } from '..';

jest.mock('knex');
jest.mock('../../../common/config', () => {
  return {
    __esModule: true,
    default: {
      logLevel: 'SILENT',
      postgres: {},
    },
  };
});

describe('crawler', () => {
  describe('crawlLevels', () => {
    const level = {
      level: 41000,
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
        .mockResolvedValue({ result: {} });

      jest
        .spyOn(postgresAdapter, 'getUnindexedLevel')
        .mockResolvedValueOnce(level)
        .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');

      await crawlLevels();
      expect(comprimaService.indexLevel).toBeCalledWith(level.level);
    });

    it('clears error field if level is crawled successfully', async () => {
      level.error = 'Some error';

      jest
        .spyOn(comprimaService, 'indexLevel')
        .mockResolvedValue({ result: {} });

      jest
        .spyOn(postgresAdapter, 'getUnindexedLevel')
        .mockResolvedValueOnce(level)
        .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');

      await crawlLevels();
      expect(postgresAdapter.updateLevel).toBeCalledWith({
        ...level,
        error: null,
      });
    });

    describe('increases crawl attempts', () => {
      beforeEach(() => {
        level.attempts = 5;
      });

      it('after a successful crawl', async () => {
        jest
          .spyOn(comprimaService, 'indexLevel')
          .mockResolvedValue({ result: {} });

        jest
          .spyOn(postgresAdapter, 'getUnindexedLevel')
          .mockResolvedValueOnce(level)
          .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');

        await crawlLevels();
        expect(comprimaService.indexLevel).toBeCalledWith(level.level);
        expect(postgresAdapter.updateLevel).toBeCalledWith({
          ...level,
          attempts: 6,
        });
      });

      it('after a failed crawl', async () => {
        jest
          .spyOn(comprimaService, 'indexLevel')
          .mockRejectedValueOnce('Some error');

        jest
          .spyOn(postgresAdapter, 'getUnindexedLevel')
          .mockResolvedValueOnce(level)
          .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');

        await crawlLevels();
        expect(comprimaService.indexLevel).toBeCalledWith(level.level);
        expect(postgresAdapter.updateLevel).toBeCalledWith({
          ...level,
          attempts: 6,
        });
      });
    });

    describe('does not increases crawl attempts', () => {
      beforeEach(() => {
        level.attempts = 5;
      });

      describe('when the comprima-adapter connection fails due to', () => {
        it('ECONNREFUSED', async () => {
          jest
            .spyOn(comprimaService, 'indexLevel')
            .mockRejectedValueOnce('connect ECONNREFUSED 127.0.0.1');

          jest
            .spyOn(postgresAdapter, 'getUnindexedLevel')
            .mockResolvedValueOnce(level)
            .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');

          await crawlLevels();
          expect(comprimaService.indexLevel).toBeCalledWith(level.level);
          expect(postgresAdapter.updateLevel).toBeCalledWith({
            ...level,
            attempts: 5,
          });
        });

        it('ECONNRESET', async () => {
          jest
            .spyOn(comprimaService, 'indexLevel')
            .mockRejectedValueOnce('ECONNRESET');

          jest
            .spyOn(postgresAdapter, 'getUnindexedLevel')
            .mockResolvedValueOnce(level)
            .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');

          await crawlLevels();
          expect(comprimaService.indexLevel).toBeCalledWith(level.level);
          expect(postgresAdapter.updateLevel).toBeCalledWith({
            ...level,
            attempts: 5,
          });
        });

        it('ETIMEDOUT', async () => {
          jest
            .spyOn(comprimaService, 'indexLevel')
            .mockRejectedValueOnce('ETIMEDOUT');

          jest
            .spyOn(postgresAdapter, 'getUnindexedLevel')
            .mockResolvedValueOnce(level)
            .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');

          await crawlLevels();
          expect(comprimaService.indexLevel).toBeCalledWith(level.level);
          expect(postgresAdapter.updateLevel).toBeCalledWith({
            ...level,
            attempts: 5,
          });
        });
      });
    });
  });
});
