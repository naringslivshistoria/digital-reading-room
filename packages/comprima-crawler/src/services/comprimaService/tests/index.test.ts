import axios from 'axios';
import { indexLevel } from '..';

jest.mock('axios');

jest.mock('../../../common/config', () => {
  return {
    __esModule: true,
    default: {
      comprimaUrl: 'http://fakehost:7357',
      logLevel: 'ERROR',
    },
  };
});

describe('comprimaAdapter', () => {
  beforeEach(() => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: 'fake data' });
  });

  describe('indexLevel', () => {
    it('passes correct level to comprima adapter', async () => {
      await indexLevel(1);
      expect(axios.get).toBeCalledWith(
        'http://fakehost:7357/indexLevel?level=1',
        {}
      );
    });
  });
});
