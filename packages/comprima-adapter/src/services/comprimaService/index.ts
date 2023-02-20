import soapRequest from 'easy-soap-request'
import { XMLParser } from 'fast-xml-parser';
import transformer from './transformer'
import KoaRouter from '@koa/router'
import axios from 'axios'

import {
  Document
} from '../../common/types'

let sessionId : string | undefined; 
const user = process.env.COMPRIMA_USER
const password = process.env.COMPRIMA_PASSWORD
const serviceUrl = process.env.COMPRIMA_SERVICE_URL 

const search = async (freeTextQuery: string | string[], levels: string[], skip?: number) : Promise<Document[]> => {
  if (!sessionId) {
    sessionId = await login(user, password)
  }

  const result = await performSearch(freeTextQuery, levels, skip)

  return result
}

const createRequestHeaders = (action : string) : any => {
  const requestHeaders = {
    'user-agent': 'comprima-adapter',
    'Content-Type': 'application/soap+xml;charset=UTF-8',
    'soapAction': action
  };

  return requestHeaders
}

const login = async (user: string | undefined, password: string | undefined) : Promise<string> => {
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
    const { response: { body } } = await soapRequest({ method: 'POST', url: serviceUrl, headers: requestHeaders, xml: payload, timeout: 60 * 1000 })

    const parser = new XMLParser()
    const loginResponse = parser.parse(body)

    const sessionId = loginResponse['s:Envelope']['s:Body'].LoginResponse.LoginResult
    return sessionId
  } catch (error) {
    console.error('Comprima login request failed', error)
    throw new Error('Comprima login request failed')
  }
}

const performSearch = async(query: string | string[], levels: string[], skip?: number) : Promise<Document[]> => {
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
  '  &lt;Take&gt;1000&lt;/Take&gt;' +
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
  
    const { response: { body } } = await soapRequest({ method: 'POST', url: serviceUrl, headers: requestHeaders, xml: payload, timeout: 60 * 1000 })

    const parser = new XMLParser()
    const searchResponse = parser.parse(body)
    let documentsResult = searchResponse['s:Envelope']['s:Body'].GetDocumentsResponse.GetDocumentsResult
    documentsResult = documentsResult.replace(/&#xD;/gim, '').replace(/&gt;/gim, '>').replace(/&lt;/gim, '<')

    const documents = parser.parse(documentsResult).C3DocumentResponse.Documents.Document
    const transformedDocuments = transformer.transformDocuments(documents)

    return transformedDocuments
  } catch (error) {
    console.error('Comprima search request failed', error)
    throw new Error('Comprima search request failed')
  }
}

const getDocument = async (documentId: number) : Promise<Document> => {
  if (!sessionId) {
    sessionId = await login(user, password)
  }

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
  '  &lt;IncludeLogs&gt;true&lt;/IncludeLogs&gt;' +
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
  
    const { response: { body } } = await soapRequest({ method: 'POST', url: serviceUrl, headers: requestHeaders, xml: payload, timeout: 60 * 1000 })

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

export const routes = (router: KoaRouter) => {
  router.get('/search', async (ctx) => {
    const { query } = ctx.request
    if (!query.query) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: query' }
      return
    }
    if (!query.levels) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: levels' }
      return
    }
  
    try
    {
      const levels = Array.isArray(query.levels) ? query.levels : query.levels.split(',')
      const results = await search(query.query, levels)
      ctx.body = { numResults: results.length, results: results, freeTextQuery: ctx.request.query.freeTextQuery }
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err}
    }
  });

  router.get('/document/:documentId/attachment', async (ctx) => {
    if (!ctx.params.documentId) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing document id' }
      return
    }
  
    try
    {
      const document = await getDocument(parseInt(ctx.params.documentId))
      const attachment = await axios.get(document.pages[0].url, { responseType: 'arraybuffer' })

      ctx.set('content-type', document.fields.mimeType?.value)
      ctx.body = attachment.data
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err}
    }
  })  
  
  router.get('/document/:documentId', async (ctx) => {
    if (!ctx.params.documentId) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing document id' }
      return
    }
  
    try
    {
      const results = await getDocument(parseInt(ctx.params.documentId))
      ctx.body = results
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err}
    }
  })  
}

export default {
  search,
  getDocument
}
