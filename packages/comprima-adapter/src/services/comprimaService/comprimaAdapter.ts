import soapRequest from 'easy-soap-request'
import { XMLParser } from 'fast-xml-parser'
import axios from 'axios'
import axiosRetry from 'axios-retry'

import transformer from './transformer'
import { Document } from '../../common/types'

let sessionId : string | undefined
const user = process.env.COMPRIMA_USER
const password = process.env.COMPRIMA_PASSWORD
const serviceUrl = process.env.COMPRIMA_SERVICE_URL 
const timeout = 5 * 60 * 1000 

axiosRetry(axios, { retries: 3 })

const createRequestHeaders = (action : string) => {
  const requestHeaders = {
    'user-agent': 'comprima-adapter',
    'Content-Type': 'application/soap+xml;charset=UTF-8',
    'soapAction': action,
  }

  return requestHeaders
}

interface SoapOptions {
      method?: string | undefined
      url: string
      headers?: object | string | undefined
      xml: string
      timeout?: number | undefined
      maxBodyLength?: number | undefined
      maxContentLength?: number | undefined
}

const ensureLogin = async (options: SoapOptions, relogin = false) => {
  if (!sessionId || relogin) {
    sessionId = await login(user, password)
    options.xml = options.xml.replace(/<ns:sessionId>.*?<\/ns:sessionId>/, '<ns:sessionId>' + sessionId + '</ns:sessionId>')
  }
}

/**
 * Generic wrapper for soapRequest that will retry and do a login if session has expired
 * 
 * @param options soapRequest options object
 * @returns soapRequest result
 */
const makeSoapRequest = async (options : SoapOptions) => {
  let result

  await ensureLogin(options)

  try {
    result = await soapRequest(options)

    return result
  } catch (error) {
    if (typeof(error) === 'string' && error.indexOf('Sessionen är inte aktiv') !== -1) {
      // Check for auth error, which is returned as a 500
      console.info('No valid login session')
      await ensureLogin(options, true)
      result = await soapRequest(options)

      return result
    }

    throw error
  }
}

const login = async (user: string | undefined, password: string | undefined) => {
  console.info('Logging in to Comprima')

  const action = 'http://www.dms-digital.se/c3/2011/02/IC3SearchService/Login'
  const requestHeaders = createRequestHeaders(action)

  const payload = '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ns="http://www.dms-digital.se/c3/2011/02">' +
    '<soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">' +
    '  <wsa:Action>' + action + '</wsa:Action>' +
    `  <wsa:To>${serviceUrl}</wsa:To>` +
    '</soap:Header>' +
    '<soap:Body>' +
    '  <ns:Login>' +
    '     <ns:username>' + user + '</ns:username>' +
    '     <ns:password>' + password + '</ns:password>' +
    '  </ns:Login>' +
    '</soap:Body>' +
    '</soap:Envelope>'

  if (!serviceUrl)
  {
    console.error('No COMPRIMA_SERVICE_URL has been set')
    throw new Error('No COMPRIMA_SERVICE_URL has been set')
  }

  try {
    const { response: { body } } = await soapRequest({ method: 'POST', url: serviceUrl, headers: requestHeaders, xml: payload, timeout })

    const parser = new XMLParser()
    const loginResponse = parser.parse(body)

    const sessionId = loginResponse['s:Envelope']['s:Body'].LoginResponse.LoginResult
    console.info('Comprima login complete')
    return sessionId
  } catch (error) {
    console.error('Comprima login request failed', error)
    throw new Error('Comprima login request failed')
  }
}

const getDocuments = async(levels: string[], skip?: number, batchSize = 10) : Promise<Document[]> => {
  const action = 'http://www.dms-digital.se/c3/2011/02/IC3SearchService/GetDocuments'
  const skipTo = skip ?? 0

  const requestHeaders = createRequestHeaders(action)
  let payload = '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ns="http://www.dms-digital.se/c3/2011/02">' +
  '  <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">' +
  '      <wsa:Action>' + action + '</wsa:Action>' +
  `  <wsa:To>${serviceUrl}</wsa:To>` +
  '  </soap:Header>' +
  '  <soap:Body>' +
  '    <ns:GetDocuments>' +
  '       <ns:query>' +
  '&lt;C3DocumentQuery xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
  '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
  '  xmlns="http://www.dms-digital.se/c3/2011/02"&gt;' +
  `  &lt;Skip&gt;${skipTo}&lt;/Skip&gt;` +
  `  &lt;Take&gt;${batchSize}&lt;/Take&gt;` +
  '  &lt;FindIn&gt;' +
  '    &lt;Levels&gt;'

  levels.forEach((level) => {
    payload +=   '      &lt;Level&gt;' +
    `        &lt;Id&gt;${level}&lt;/Id&gt;` +
    '      &lt;/Level&gt;'
  })

  payload +=
  '    &lt;/Levels&gt;' +
  '  &lt;/FindIn&gt;' +
  '  &lt;FilterBy&gt;' +
  '    &lt;DocumentStates&gt;' +
  '      &lt;DocumentState&gt;Registered&lt;/DocumentState&gt;' +
  '    &lt;/DocumentStates&gt;' +
  '    &lt;Properties&gt;' +
  '      &lt;Property&gt;' +
  '        &lt;Value&gt;false&lt;/Value&gt;' +
  '        &lt;Operator&gt;Equals&lt;/Operator&gt;' +
  '        &lt;PropertyType&gt;IsProtected&lt;/PropertyType&gt;' +
  '      &lt;/Property&gt;' +
  '    &lt;/Properties&gt;' +
  '  &lt;/FilterBy&gt;' +
  '  &lt;Options&gt;' +
  '    &lt;IncludeIndexFieldNames&gt;true&lt;/IncludeIndexFieldNames&gt;' +
  '    &lt;IncludeLogs&gt;true&lt;/IncludeLogs&gt;' +
  '    &lt;ForceReloadCache&gt;false&lt;/ForceReloadCache&gt;' +
  ' &lt;/Options&gt;' +
  '&lt;/C3DocumentQuery&gt;' +
  '         </ns:query>' +
  '         <ns:sessionId>' + sessionId + '</ns:sessionId>' +
  '      </ns:GetDocuments>' +
  '   </soap:Body>' +
  '</soap:Envelope>'

  try {
    if (!serviceUrl)
    {
      console.error('No COMPRIMA_SERVICE_URL has been set')
      throw new Error('No COMPRIMA_SERVICE_URL has been set')
    }
  
    const { response: { body } } = await makeSoapRequest({ method: 'POST', url: serviceUrl, headers: requestHeaders, xml: payload, timeout })

    const parser = new XMLParser()
    const searchResponse = parser.parse(body)
    let documentsResult = searchResponse['s:Envelope']['s:Body'].GetDocumentsResponse.GetDocumentsResult
    documentsResult = documentsResult.replace(/&#xD;/gim, '').replace(/&gt;/gim, '>').replace(/&lt;/gim, '<')

    const documents = parser.parse(documentsResult).C3DocumentResponse.Documents.Document

    if (!documents) {
      return []
    }

    try {
      const documentArray = Array.isArray(documents) ? documents : Array(documents)
      const transformedDocuments = transformer.transformDocuments(documentArray)

      return transformedDocuments
    } catch (error) {
      console.error('Error transforming documents', documents)
      throw error
    }
  } catch (error) {
    console.error('Comprima search request failed', error)
    throw new Error('Comprima search request failed')
  }
}

const getDocument = async (documentId: number) : Promise<Document> => {
  const action = 'http://www.dms-digital.se/c3/2011/02/IC3SearchService/GetDocuments'

  const requestHeaders = createRequestHeaders(action)
  const payload = '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ns="http://www.dms-digital.se/c3/2011/02">' +
  '  <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">' +
  '      <wsa:Action>' + action + '</wsa:Action>' +
  `  <wsa:To>${serviceUrl}</wsa:To>` +
  '  </soap:Header>' +
  '  <soap:Body>' +
  '    <ns:GetDocuments>' +
  '       <ns:query>' +
  '&lt;C3DocumentQuery xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xmlns="http://www.dms-digital.se/c3/2011/02"&gt;' +
  '&lt;Skip&gt;0&lt;/Skip&gt;' +
  '&lt;Take&gt;10&lt;/Take&gt;' +
  '&lt;FilterBy&gt;' +
  '  &lt;Ids&gt;' +
  '    &lt;unsignedInt&gt;' + documentId + '&lt;/unsignedInt&gt;' +
  '  &lt;/Ids&gt;' +
  '&lt;/FilterBy&gt;' +
  '&lt;Options&gt;' +
  '  &lt;IncludeIndexFieldNames&gt;true&lt;/IncludeIndexFieldNames&gt;' +
  '  &lt;IncludeLogs&gt;false&lt;/IncludeLogs&gt;' +
  '  &lt;ForceReloadCache&gt;false&lt;/ForceReloadCache&gt;' +
  '&lt;/Options&gt;' +
  '&lt;/C3DocumentQuery&gt;' +
  '         </ns:query>' +
  '         <ns:sessionId>' + sessionId + '</ns:sessionId>' +
  '      </ns:GetDocuments>' +
  '   </soap:Body>' +
  '</soap:Envelope>'

  try {
    if (!serviceUrl)
    {
      console.error('No COMPRIMA_SERVICE_URL has been set')
      throw new Error('No COMPRIMA_SERVICE_URL has been set')
    }
  
    const { response: { body } } = await makeSoapRequest({ method: 'POST', url: serviceUrl, headers: requestHeaders, xml: payload, timeout })

    const parser = new XMLParser()
    const searchResponse = parser.parse(body)
    let documentsResult = searchResponse['s:Envelope']['s:Body'].GetDocumentsResponse.GetDocumentsResult
    documentsResult = documentsResult.replace(/&#xD;/gim, '').replace(/&gt;/gim, '>').replace(/&lt;/gim, '<')

    const document = parser.parse(documentsResult).C3DocumentResponse.Documents.Document
    const transformedDocument = transformer.transformDocument(document)

    return transformedDocument
  } catch (error) {
    console.error('Comprima search request failed', error)
    throw new Error('Comprima search request failed')
  }
}

const getAttachment = async (document: Document) => {
  const attachment = await axios.get(document.pages[0].url, { responseType: 'arraybuffer' })
  return attachment
}

export default {
  getDocuments,
  getDocument,
  getAttachment,
}