import KoaRouter from '@koa/router';
import comprima from './services/comprimaService';
import index from './services/indexingService';
import { routes as comprimaRoutes } from './services/comprimaService';

const router = new KoaRouter();

router.get('/', async (ctx) => {
  ctx.body = 'Hello world';
});

router.get('/index/:documentId', async (ctx) => {
  if (!ctx.params.documentId) {
    ctx.status = 400;
    ctx.body = { errorMessage: 'Missing document id' };
    return;
  }

  try {
    const document = await comprima.getDocument(
      parseInt(ctx.params.documentId)
    );
    await index.indexDocument(document);
    ctx.body = { result: 'success' };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { results: 'error: ' + err };
  }
});

router.get('/indexlevel', async (ctx) => {
  if (!ctx.query.level) {
    ctx.status = 400;
    ctx.body = { errorMessage: 'Missing parameter: level' };
    return;
  }

  let skip = 0;
  if (ctx.query.skip) {
    skip = parseInt(
      Array.isArray(ctx.query.skip) ? ctx.query.skip[0] : ctx.query.skip
    );
  }

  try {
    const level = Array.isArray(ctx.query.level)
      ? ctx.query.level[0]
      : ctx.query.level;
    const results = await comprima.search(level, skip);

    let successful = 0;

    // TODO: Set level on document

    await Promise.all(
      results.map(async (document) => {
        try {
          await index.indexDocument(document);
          successful++;
        } catch (err) {
          console.error(err);
        }

        return document;
      }, 0)
    );

    ctx.body = {
      result: { successful: successful, failed: results.length - successful },
    };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { results: 'error: ' + err };
  }
});

comprimaRoutes(router);

export default router;
