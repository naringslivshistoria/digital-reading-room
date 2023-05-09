import KoaRouter from '@koa/router';
import { Client, errors } from '@elastic/elasticsearch';
import { Document } from '../../common/types';
import config from '../../common/config';
import axios from 'axios';

class DocumentNotFoundError extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DocumentNotFoundError.prototype);
  }
}

const getAttachmentStream = async (id: string) => {
  const url = `${
    config.comprimaAdapter?.url || 'https://comprima.dev.cfn.iteam.se'
  }/document/${id}/attachment`;

  const response = await axios({
    method: 'get',
    url: url,
    responseType: 'stream',
  });

  return response;
};

const client = new Client({
  node: config.elasticSearch.url,
});

const getDocument = async (id: string) => {
  try {
    const result = await client.get({
      index: config.elasticSearch.indexName,
      id: id,
    });

    const document = result._source as Document;
    return document;
  } catch (err) {
    if (err instanceof errors.ResponseError) {
      if ((err as errors.ResponseError).meta.statusCode === 404) {
        throw new DocumentNotFoundError('Document not found');
      }
    }

    throw err;
  }
};

export const routes = (router: KoaRouter) => {
  router.get('(.*)/document/:id', async (ctx) => {
    const { id } = ctx.params;

    try {
      const results = await getDocument(id);
      ctx.body = { results: results };
    } catch (err) {
      ctx.status = 500;
      ctx.body = { results: 'error: ' + err };
    }
  });

  router.get('(.*)/document/:id/attachment/:filename*', async (ctx) => {
    const { id } = ctx.params;
    if (!id) {
      ctx.status = 400;
      ctx.body = { errorMessage: 'Missing parameter: id' };
      return;
    }

    try {
      // Try to get document to verify that it is indexed in elasticsearch and
      // that attachment thereby is allowed to be retrieved
      const document = await getDocument(id);

      if (!document) {
        ctx.status = 404;
        return;
      }

      const response = await getAttachmentStream(id);
      ctx.type = response.headers['content-type']?.toString() ?? 'image/jpeg';
      ctx.body = response.data;
    } catch (err) {
      if (err instanceof DocumentNotFoundError) {
        ctx.status = 404;
        ctx.body = { results: 'error: document not found' };
      } else {
        ctx.status = 500;
        ctx.body = { results: 'error: ' + err };
      }
    }
  });
};
