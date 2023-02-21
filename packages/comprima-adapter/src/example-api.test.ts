import request from 'supertest';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import api from './api';

const app = new Koa();
app.use(bodyParser());
app.use(api.routes());

describe('indexSearch', () => {
  it('requires a query parameter', async () => {
    const res = await request(app.callback()).get('/indexSearch');
    expect(res.status).toBe(400);
    expect(res.body.errorMessage).toBe('Missing parameter: query');
  });
});
