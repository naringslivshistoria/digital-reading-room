import request from 'supertest';
import Koa from 'koa';
import api from './api';
import bodyParser from 'koa-bodyparser';

const app = new Koa();
app.use(bodyParser());
app.use(api.routes());

describe('app', () => {
  describe('GET /search?freeTextQuery', () => {
    it('responds', async () => {
      const res = await request(app.callback()).get(
        '/search?query=searchQuery'
      );

      // TODO: Replace with a meaningful test.
      // expect(res.status).toBe(200);
      // expect(res.body).toStrictEqual({
      //   results: [''],
      //   query: 'searchQuery',
      // });
    });

    it('requires a free text query parameter', async () => {
      const res = await request(app.callback()).get('/search');
      expect(res.status).toBe(400);
      expect(res.body.errorMessage).toBe('Missing parameter: query');
    });
  });
});
