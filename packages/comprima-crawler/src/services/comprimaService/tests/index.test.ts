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
      await indexSearch('123')
      expect(axios.get).toBeCalledWith('http://fakehost:7357/indexSearch?query=ignored&levels=123', {})
    })
  })
})
