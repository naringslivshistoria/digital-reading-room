import request from 'supertest';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import api from './api';

const app = new Koa();
app.use(bodyParser());
app.use(api.routes());

describe('indexlevel', () => {
  it('requires a levels parameter', async () => {
    const res = await request(app.callback()).get('/indexlevel');
    expect(res.status).toBe(400);
    expect(res.body.errorMessage).toBe('Missing parameter: level');
  });
});
