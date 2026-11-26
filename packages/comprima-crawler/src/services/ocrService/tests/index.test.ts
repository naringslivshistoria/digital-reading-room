import axios from 'axios'
import { ocrNext } from '..'

const mockSearch = jest.fn()
const mockUpdate = jest.fn()

jest.mock('axios')
jest.mock('@elastic/elasticsearch', () => {
  return {
    Client: jest.fn(() => ({
      search: (...args: unknown[]) => mockSearch(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    })),
  }
})
jest.mock('../../../common/config', () => {
  return {
    __esModule: true,
    default: {
      logLevel: 'SILENT',
      comprimaUrl: 'http://adapter',
      ocrUrl: 'http://ocr',
      elasticSearch: { url: 'http://elastic', indexName: 'test' },
      ocr: { batchSize: 1, descriptionLanguage: 'sv', dpi: 200 },
    },
  }
})

const mockedAxios = axios as jest.MockedFunction<typeof axios> &
  jest.Mocked<typeof axios>

const ocrResponse = {
  data: {
    document: {
      filename: 'document.jpg',
      mime_type: 'image/jpeg',
      page_count: 1,
      pages: [{ page_index: 0, image_text: 'text', image_description: '' }],
      full_text: 'text',
    },
  },
}

const adapterIs = (available: boolean) => {
  mockedAxios.get.mockImplementation(async (url: string) => {
    if (url === 'http://adapter/healthz' && !available) {
      throw new Error('Request failed with status code 500')
    }

    return { data: {} }
  })
}

const savedStatuses = () =>
  mockUpdate.mock.calls.map(([update]) => update.doc.ocrStatus)

describe('ocrService', () => {
  describe('ocrNext', () => {
    let setTimeoutSpy: jest.SpyInstance

    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)

      // Makes the wait return at once.
      setTimeoutSpy = jest
        .spyOn(global, 'setTimeout')
        .mockImplementation((callback: () => void) => {
          callback()
          return 0 as unknown as NodeJS.Timeout
        })

      mockSearch.mockResolvedValue({ hits: { hits: [{ _id: '1' }] } })
      mockUpdate.mockResolvedValue({})
      mockedAxios.mockResolvedValue({
        data: Buffer.from('file'),
        headers: { 'content-type': 'image/jpeg' },
      })
      mockedAxios.post.mockResolvedValue(ocrResponse)
      adapterIs(true)
    })

    afterEach(() => {
      jest.restoreAllMocks()
      jest.clearAllMocks()
    })

    it('saves the OCR result', async () => {
      await expect(ocrNext()).resolves.toBe(1)

      expect(savedStatuses()).toEqual(['success'])
    })

    it('marks the document as failed when OCR fails', async () => {
      mockedAxios.post.mockRejectedValue(new Error('OCR failed'))

      await expect(ocrNext()).resolves.toBe(1)

      expect(savedStatuses()).toEqual(['error'])
      expect(mockedAxios.get).not.toHaveBeenCalledWith(
        'http://adapter/healthz',
        expect.anything()
      )
    })

    it('marks the document as failed when only its attachment cannot be fetched', async () => {
      mockedAxios.mockRejectedValue(new Error('Request failed'))

      await expect(ocrNext()).resolves.toBe(1)

      expect(savedStatuses()).toEqual(['error'])
      expect(setTimeoutSpy).not.toHaveBeenCalled()
    })

    it('leaves the document unmarked and waits when the adapter is not available', async () => {
      mockedAxios.mockRejectedValue(new Error('Request failed'))
      adapterIs(false)

      await expect(ocrNext()).resolves.toBe(1)

      expect(mockUpdate).not.toHaveBeenCalled()
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 60000)
    })
  })
})
