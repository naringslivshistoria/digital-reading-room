import soapRequest from 'easy-soap-request'

jest.mock('easy-soap-request')

const mockedSoapRequest = jest.mocked(soapRequest)

const fault = (message: string) =>
  '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"><s:Body><s:Fault>' +
  '<s:Code><s:Value>s:Sender</s:Value></s:Code>' +
  `<s:Reason><s:Text xml:lang="sv-SE">${message}</s:Text></s:Reason>` +
  '</s:Fault></s:Body></s:Envelope>'

const response = (body: string) => ({
  response: {
    headers: {},
    body: `<s:Envelope><s:Body>${body}</s:Body></s:Envelope>`,
    statusCode: 200,
  },
})

// A stand-in for Comprima that only accepts the session from the latest login.
const comprima = {
  logins: 0,
  validSession: '',
  failNextLogin: false,
  sessionError: 'Sessionen är inte aktiv',
}

const loadAdapter = () => {
  let adapter: typeof import('../comprimaAdapter').default | undefined

  // The adapter keeps its session in the module, so every test loads its own.
  jest.isolateModules(() => {
    adapter = jest.requireActual('../comprimaAdapter').default
  })

  if (!adapter) {
    throw new Error('Could not load the adapter')
  }

  return adapter
}

describe('comprimaAdapter', () => {
  beforeAll(() => {
    process.env.COMPRIMA_SERVICE_URL = 'http://comprima.test'
  })

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
    jest.spyOn(console, 'info').mockImplementation(() => undefined)
    jest.spyOn(console, 'error').mockImplementation(() => undefined)

    comprima.logins = 0
    comprima.validSession = ''
    comprima.failNextLogin = false
    comprima.sessionError = 'Sessionen är inte aktiv'

    mockedSoapRequest.mockReset()
    mockedSoapRequest.mockImplementation(async (options) => {
      const xml = options?.xml ?? ''

      if (xml.includes('<ns:Login>')) {
        comprima.logins++

        if (comprima.failNextLogin) {
          comprima.failNextLogin = false
          throw new Error('connect ECONNREFUSED')
        }

        comprima.validSession = `session-${comprima.logins}`

        return response(
          `<LoginResponse><LoginResult>${comprima.validSession}</LoginResult></LoginResponse>`
        )
      }

      if (
        !xml.includes(`<ns:sessionId>${comprima.validSession}</ns:sessionId>`)
      ) {
        // easy-soap-request rejects with the response body when Comprima answers with an error status.
        throw fault(comprima.sessionError)
      }

      return response(
        '<GetDocumentsResponse><GetDocumentsResult>' +
          '&lt;C3DocumentResponse&gt;&lt;Documents&gt;&lt;/Documents&gt;&lt;/C3DocumentResponse&gt;' +
          '</GetDocumentsResult></GetDocumentsResponse>'
      )
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it.each(['Sessionen är inte aktiv', 'Session has expired'])(
    'logs in again and retries when Comprima answers "%s"',
    async (sessionError) => {
      comprima.sessionError = sessionError
      const adapter = loadAdapter()

      await expect(adapter.getDocuments('1', 0, 1)).resolves.toEqual([])
      expect(comprima.logins).toBe(1)

      comprima.validSession = ''

      await expect(adapter.getDocuments('1', 0, 1)).resolves.toEqual([])
      await expect(adapter.getDocuments('1', 0, 1)).resolves.toEqual([])
      expect(comprima.logins).toBe(2)
    }
  )

  it('does not log in again on other errors', async () => {
    comprima.sessionError = 'Något annat gick fel'
    const adapter = loadAdapter()

    await adapter.getDocuments('1', 0, 1)
    comprima.validSession = ''

    await expect(adapter.getDocuments('1', 0, 1)).rejects.toThrow(
      'Comprima search request failed'
    )
    expect(comprima.logins).toBe(1)
  })

  it('logs in on the next request after a failed login', async () => {
    comprima.failNextLogin = true
    const adapter = loadAdapter()

    await expect(adapter.getDocuments('1', 0, 1)).rejects.toThrow(
      'Comprima search request failed'
    )

    await expect(adapter.getDocuments('1', 0, 1)).resolves.toEqual([])
    expect(comprima.logins).toBe(2)
  })
})
