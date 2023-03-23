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

    beforeAll(() => {
      jest
        .spyOn(postgresAdapter, 'getUnindexedLevel')
        .mockResolvedValueOnce(level)
        .mockRejectedValueOnce('NO_UNINDEXED_LEVELS');
      jest.spyOn(postgresAdapter, 'updateLevel').mockResolvedValue(true);
      jest
        .spyOn(comprimaService, 'indexLevel')
        .mockResolvedValue({ result: {} });
    });

    it('calls comprima service with correct levels', async () => {
      await crawlLevels();
      expect(comprimaService.indexLevel).toBeCalledWith(level.level);
    });
  });
});
