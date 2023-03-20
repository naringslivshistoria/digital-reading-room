import { indexSearch } from '../../comprimaService'
import { crawlLevels } from '..'

jest.mock('../../comprimaService', () => {
  const actual = jest.requireActual('../../comprimaService');

  return {
      ...actual,
      indexSearch: jest.fn()
  };
})

jest.mock('../../../common/config', () => {
  return {
    __esModule: true,
    default: {
      crawler: {
        batchSize: 10,
      },
      logLevel: 'SILENT',
    }
  }
})

describe('crawler', () => {
  describe('crawlLevels', () => {
    it('calls comprima service with correct levels', async () => {
      await crawlLevels({ lower: 41000, upper: 41029 })
      expect(indexSearch).toBeCalledWith([41000, 41001, 41002, 41003, 41004, 41005, 41006, 41007, 41008, 41009])
      expect(indexSearch).toBeCalledWith([41010, 41011, 41012, 41013, 41014, 41015, 41016, 41017, 41018, 41019])
      expect(indexSearch).toBeCalledWith([41020, 41021, 41022, 41023, 41024, 41025, 41026, 41027, 41028, 41029])
    })
  })
})
