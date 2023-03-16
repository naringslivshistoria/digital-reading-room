import axios from 'axios'
import { indexSearch } from '..'

jest.mock('axios')

jest.mock('../../../common/config', () => {
  return {
    __esModule: true,
    default: {
      comprimaUrl: 'http://fakehost:7357',
      logLevel: 'ERROR',
    }
  }
})

describe('comprimaAdapter', () => {
  beforeEach(() => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: 'fake data' })
  })
  
  describe('indexSearch', () => {
    it('calls Comprima Adapter', async () => {
      await indexSearch([])
      expect(axios.get).toBeCalledWith(expect.stringContaining('http://fakehost:7357/indexSearch?query=ignored&levels='), {})
    })

    it('passes correct levels', async () => {
      await indexSearch([1,2,4,8])
      expect(axios.get).toBeCalledWith('http://fakehost:7357/indexSearch?query=ignored&levels=1,2,4,8', {})
    })
  })
})
