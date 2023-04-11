import request from 'supertest';
import Koa from 'koa';
import KoaRouter from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { routes } from '../index';

const app = new Koa();
const router = new KoaRouter();
routes(router);
app.use(bodyParser());
app.use(router.routes());

describe('comprimaService', () => {
  describe('GET /documents', () => {
    it('requires the levels query parameter', async () => {
      const res = await request(app.callback()).get('/documents');
      expect(res.status).toBe(400);
      expect(res.body.errorMessage).toBe('Missing parameter: level');
    });
  });
});
