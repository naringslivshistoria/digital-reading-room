import request from 'supertest'
import Koa from 'koa'
import KoaRouter from '@koa/router'
import bodyParser from '@koa/bodyparser'
import { Client } from '@elastic/elasticsearch'
import axios from 'axios'
import { routes } from '../index'
import documentResultMock from './documentResultMock'
import config from '../../../common/config'
import fs, { ReadStream } from 'fs'
import { Readable } from 'stream'
import koaJwt from 'koa-jwt'
import jwt from 'jsonwebtoken'

const app = new Koa()
const router = new KoaRouter()
routes(router)
app.use(bodyParser())

app.use(koaJwt({ secret: config.auth.secret, cookie: 'readingroom' }))
app.use(router.routes())

jest.mock('axios')
const mockedAxios = jest.mocked(axios, true)

const mockedImageBuffer = Buffer.from('image-data', 'utf8')

const getMockedStream = () => {
  const newStream = new Readable()
  newStream.push(mockedImageBuffer)
  newStream.push(null)
  return newStream
}

const token = jwt.sign(
  {
    sub: 'foo',
    username: 'bar',
    depositors: undefined,
    archiveInitiators: [
      'Svenskt Näringsliv>Svenska Arbetsgivareföreningen (SAF)',
    ],
  },
  config.auth.secret,
  {
    expiresIn: config.auth.expiresIn,
  }
)

describe('documentService', () => {
  describe('GET /document/:id', () => {
    it('requires a document id parameter', async () => {
      const res = await request(app.callback())
        .get('/document')
        .set('Authorization', 'Bearer ' + token)
      expect(res.status).toBe(404)
    })

    it('gets the document from elastic search', async () => {
      const elasticSpy = jest
        .spyOn(Client.prototype, 'get')
        .mockResolvedValue(documentResultMock)
      const id = '1337'

      await request(app.callback())
        .get('/document/' + id)
        .set('Authorization', 'Bearer ' + token)

      expect(elasticSpy).toBeCalledWith({
        index: config.elasticSearch.indexName,
        id,
      })
    })

    it('returns a document', async () => {
      jest.spyOn(Client.prototype, 'get').mockResolvedValue(documentResultMock)

      const res = await request(app.callback())
        .get('/document/1337')
        .set('Authorization', 'Bearer ' + token)
      expect(res.status).toEqual(200)
      expect(res.body).toEqual({
        results: documentResultMock._source,
      })
    })

    it('returns a document for a user with series access and acess to another deponent', async () => {
      jest.spyOn(Client.prototype, 'get').mockResolvedValue(documentResultMock)

      const aToken = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: ['My Company'],
          archiveInitiators: [],
          series: [
            'Svenskt Näringsliv>Svenska Arbetsgivareföreningen (SAF)>B 8 A - SAF-tidningen',
          ],
          volumes: [],
        },
        config.auth.secret,
        {
          expiresIn: config.auth.expiresIn,
        }
      )
      const res = await request(app.callback())
        .get('/document/1337')
        .set('Authorization', 'Bearer ' + aToken)

      expect(res.status).toEqual(200)
      expect(res.body).toEqual({
        results: documentResultMock._source,
      })
    })

    it('returns a document for a user with volume access and acess to another deponent', async () => {
      jest.spyOn(Client.prototype, 'get').mockResolvedValue(documentResultMock)

      const aToken = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: ['My Company'],
          archiveInitiators: [],
          series: [],
          volumes: [
            'Svenskt Näringsliv>Svenska Arbetsgivareföreningen (SAF)>B 8 A - SAF-tidningen>13',
          ],
        },
        config.auth.secret,
        {
          expiresIn: config.auth.expiresIn,
        }
      )
      const res = await request(app.callback())
        .get('/document/1337')
        .set('Authorization', 'Bearer ' + aToken)

      expect(res.status).toEqual(200)
      expect(res.body).toEqual({
        results: documentResultMock._source,
      })
    })

    it('returns a document for a user with archive access and acess to another series', async () => {
      jest.spyOn(Client.prototype, 'get').mockResolvedValue(documentResultMock)

      const aToken = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: [],
          archiveInitiators: [
            'Svenskt Näringsliv>Svenska Arbetsgivareföreningen (SAF)',
          ],
          series: ['My Company>My Archive>My First Series'],
          volumes: [],
        },
        config.auth.secret,
        {
          expiresIn: config.auth.expiresIn,
        }
      )
      const res = await request(app.callback())
        .get('/document/1337')
        .set('Authorization', 'Bearer ' + aToken)

      expect(res.status).toEqual(200)
      expect(res.body).toEqual({
        results: documentResultMock._source,
      })
    })

    it('returns a document for a user with fileName access', async () => {
      jest.spyOn(Client.prototype, 'get').mockResolvedValue(documentResultMock)

      const aToken = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: ['My Company'],
          archiveInitiators: [],
          series: [],
          volumes: [],
          fileNames: ['DA-2016-040576-SAF_Arbetsgivaren_14_1966_21.pdf'],
        },
        config.auth.secret,
        {
          expiresIn: config.auth.expiresIn,
        }
      )
      const res = await request(app.callback())
        .get('/document/1337')
        .set('Authorization', 'Bearer ' + aToken)

      expect(res.status).toEqual(200)
      expect(res.body).toEqual({
        results: documentResultMock._source,
      })
    })

    it("returns 500 if user doesn't have access to that depositor", async () => {
      jest.spyOn(Client.prototype, 'get').mockResolvedValue(documentResultMock)

      const unauthorizedToken = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: ['My Company'],
          archiveInitiators: [],
          series: [],
          volumes: [],
        },
        config.auth.secret,
        {
          expiresIn: config.auth.expiresIn,
        }
      )

      const res = await request(app.callback())
        .get('/document/1337')
        .set('Authorization', 'Bearer ' + unauthorizedToken)

      expect(res.status).toEqual(500)
      expect(res.text).toEqual('{"results":"error: Error: Document not found"}')
    })

    it("returns 500 if user doesn't have access to that archiveInitiator", async () => {
      jest.spyOn(Client.prototype, 'get').mockResolvedValue(documentResultMock)

      const unauthorizedToken = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: ['My Company'],
          archiveInitiators: ['My Company>My Archive'],
          series: [],
          volumes: [],
        },
        config.auth.secret,
        {
          expiresIn: config.auth.expiresIn,
        }
      )

      const res = await request(app.callback())
        .get('/document/1337')
        .set('Authorization', 'Bearer ' + unauthorizedToken)

      expect(res.status).toEqual(500)
      expect(res.text).toEqual('{"results":"error: Error: Document not found"}')
    })
    it("returns 500 if user doesn't have access to that series", async () => {
      jest.spyOn(Client.prototype, 'get').mockResolvedValue(documentResultMock)

      const unauthorizedToken = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: [],
          archiveInitiators: [],
          series: ['My Company>My Archive>My First Serie'],
          volumes: [],
        },
        config.auth.secret,
        {
          expiresIn: config.auth.expiresIn,
        }
      )

      const res = await request(app.callback())
        .get('/document/1337')
        .set('Authorization', 'Bearer ' + unauthorizedToken)

      expect(res.status).toEqual(500)
      expect(res.text).toEqual('{"results":"error: Error: Document not found"}')
    })
    it("returns 500 if user doesn't have access to that volume", async () => {
      jest.spyOn(Client.prototype, 'get').mockResolvedValue(documentResultMock)

      const unauthorizedToken = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: [],
          archiveInitiators: [],
          series: [],
          volumes: ['My Company>My Archive>My First Serie>Volume 1'],
        },
        config.auth.secret,
        {
          expiresIn: config.auth.expiresIn,
        }
      )

      const res = await request(app.callback())
        .get('/document/1337')
        .set('Authorization', 'Bearer ' + unauthorizedToken)

      expect(res.status).toEqual(500)
      expect(res.text).toEqual('{"results":"error: Error: Document not found"}')
    })

    it("returns 500 if user doesn't have access to that document", async () => {
      jest.spyOn(Client.prototype, 'get').mockResolvedValue(documentResultMock)

      const unauthorizedToken = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: [],
          archiveInitiators: [],
          documentIds: [737],
        },
        config.auth.secret,
        {
          expiresIn: config.auth.expiresIn,
        }
      )

      const res = await request(app.callback())
        .get('/document/1337')
        .set('Authorization', 'Bearer ' + unauthorizedToken)

      expect(res.status).toEqual(500)
      expect(res.text).toEqual('{"results":"error: Error: Document not found"}')
    })

    it("returns 500 if user doesn't have access to that file", async () => {
      jest.spyOn(Client.prototype, 'get').mockResolvedValue(documentResultMock)

      const unauthorizedToken = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: undefined,
          archiveInitiators: undefined,
          documentIds: undefined,
          fileNames: 'myFile.jpg',
        },
        config.auth.secret,
        {
          expiresIn: config.auth.expiresIn,
        }
      )

      const res = await request(app.callback())
        .get('/document/1337')
        .set('Authorization', 'Bearer ' + unauthorizedToken)

      expect(res.status).toEqual(500)
      expect(res.text).toEqual('{"results":"error: Error: Document not found"}')
    })
  })

  describe('GET /document/:id/attachment/:filename', () => {
    it('calls comprima-adapter', async () => {
      const id = '1337'
      mockedAxios.mockReturnValue(
        Promise.resolve('SUCCESS') as Promise<unknown>
      )

      await request(app.callback())
        .get(`/document/${id}/attachment/filename.jpg`)
        .set('Authorization', 'Bearer ' + token)

      expect(mockedAxios).toBeCalledWith({
        method: 'get',
        responseType: 'stream',
        url: `${config.comprimaAdapter.url}/document/${id}/attachment`,
      })
    })

    it("returns 404 if user doesn't have access to that document", async () => {
      const id = '1337'
      mockedAxios.mockReturnValue(
        Promise.resolve('SUCCESS') as Promise<unknown>
      )

      const unauthorizedToken = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: undefined,
          archiveInitiators: undefined,
          documentIds: [737],
        },
        config.auth.secret,
        {
          expiresIn: config.auth.expiresIn,
        }
      )

      const res = await request(app.callback())
        .get(`/document/${id}/attachment/filename.jpg`)
        .set('Authorization', 'Bearer ' + unauthorizedToken)

      expect(res.status).toEqual(404)
      expect(res.text).toEqual('{"results":"error: document not found"}')
    })

    it("returns 404 if user doesn't have access to that file", async () => {
      const id = '1337'
      mockedAxios.mockReturnValue(
        Promise.resolve('SUCCESS') as Promise<unknown>
      )

      const unauthorizedToken = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: undefined,
          archiveInitiators: undefined,
          documentIds: undefined,
          fileNames: 'myFile.jpg',
        },
        config.auth.secret,
        {
          expiresIn: config.auth.expiresIn,
        }
      )

      const res = await request(app.callback())
        .get(`/document/${id}/attachment/filename.jpg`)
        .set('Authorization', 'Bearer ' + unauthorizedToken)

      expect(res.status).toEqual(404)
      expect(res.text).toEqual('{"results":"error: document not found"}')
    })
  })

  describe('app', () => {
    describe('GET /document/:documentId/thumbnail', () => {
      it('gets the document from elastic search to check security', async () => {
        const elasticSpy = jest
          .spyOn(Client.prototype, 'get')
          .mockResolvedValue(documentResultMock)
        const id = '1337'

        await request(app.callback())
          .get('/document/' + id)
          .set('Authorization', 'Bearer ' + token)

        expect(elasticSpy).toBeCalledWith({
          index: config.elasticSearch.indexName,
          id,
        })
      })

      it('reads a file from disk', async () => {
        const fsSpy = jest
          .spyOn(fs, 'createReadStream')
          .mockReturnValue(getMockedStream() as ReadStream)

        await request(app.callback())
          .get('/document/123/thumbnail')
          .set('Authorization', 'Bearer ' + token)

        expect(fsSpy).toBeCalled()
      })

      it('returns binary data', async () => {
        jest
          .spyOn(Client.prototype, 'get')
          .mockResolvedValue(documentResultMock)
        jest
          .spyOn(fs, 'createReadStream')
          .mockReturnValue(getMockedStream() as ReadStream)

        const res = await request(app.callback())
          .get('/document/123/thumbnail')
          .set('Authorization', 'Bearer ' + token)

        expect(res.status).toEqual(200)
        expect(res.body).toEqual(mockedImageBuffer)
      })

      it("returns 404 if user doesn't have access", async () => {
        jest
          .spyOn(Client.prototype, 'get')
          .mockResolvedValue(documentResultMock)

        const unauthorizedToken = jwt.sign(
          {
            sub: 'foo',
            username: 'bar',
            depositors: undefined,
            archiveInitiators: undefined,
            documentIds: [737],
          },
          config.auth.secret,
          {
            expiresIn: config.auth.expiresIn,
          }
        )

        const res = await request(app.callback())
          .get('/document/123/thumbnail')
          .set('Authorization', 'Bearer ' + unauthorizedToken)

        expect(res.status).toEqual(404)
        expect(res.text).toEqual(
          '{"results":"error: Error: Document not found"}'
        )
      })
    })
  })
})
