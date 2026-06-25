import request from 'supertest';
import Koa from 'koa';
import KoaRouter from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { Readable, PassThrough } from 'stream';
import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { createWriteStream } from 'fs';
import { routes } from '../index';
import comprimaAdapter from '../comprimaAdapter';

jest.mock('../comprimaAdapter');
jest.mock('child_process', () => ({ spawn: jest.fn() }));
jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    createWriteStream: jest.fn(),
    createReadStream: jest.fn(),
    unlink: jest.fn((_path: string, cb?: () => void) => cb && cb()),
  };
});

const mockedComprimaAdapter = jest.mocked(comprimaAdapter);
const mockedSpawn = jest.mocked(spawn);
const mockedCreateWriteStream = jest.mocked(createWriteStream);

const app = new Koa();
const router = new KoaRouter();
routes(router);
app.use(bodyParser());
app.use(router.routes());

const makeStream = (data = 'data') => {
  const stream = new Readable();
  stream.push(data);
  stream.push(null);
  return stream;
};

const makeDocument = (format: string, filename?: string) =>
  ({
    id: 1337,
    fields: {
      format: { value: format },
      ...(filename ? { filename: { value: filename } } : {}),
    },
    pages: [{ url: 'http://comprima/attachment' }],
  } as never);

// Wires up a fake ffmpeg child that emits one transcoded chunk then closes, so
// the transcode branch completes. Returns the spawn mock for assertions.
const mockTranscodingFfmpeg = () => {
  mockedCreateWriteStream.mockReturnValue(new PassThrough() as never);
  mockedSpawn.mockImplementation((): never => {
    const child = new EventEmitter() as EventEmitter & {
      stdout: PassThrough;
      stderr: EventEmitter;
      kill: jest.Mock;
    };
    child.stdout = new PassThrough();
    child.stderr = new EventEmitter();
    child.kill = jest.fn();
    setImmediate(() => {
      child.stdout.end('transcoded');
      child.emit('close', 0);
    });
    return child as never;
  });
};

describe('comprimaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /documents', () => {
    it('requires the levels query parameter', async () => {
      const res = await request(app.callback()).get('/documents');
      expect(res.status).toBe(400);
      expect(res.body.errorMessage).toBe('Missing parameter: level');
    });
  });

  describe('GET /document/:documentId/attachment', () => {
    it('forwards Range and 206/content-range for non-MP4 attachments', async () => {
      mockedComprimaAdapter.getDocument.mockResolvedValue(
        makeDocument('image/jpeg')
      );
      mockedComprimaAdapter.getAttachment.mockResolvedValue({
        data: makeStream(),
        status: 206,
        headers: {
          'content-type': 'image/jpeg',
          'content-range': 'bytes 0-100/200',
          'accept-ranges': 'bytes',
        },
      } as never);

      const res = await request(app.callback())
        .get('/document/1337/attachment')
        .set('Range', 'bytes=0-100');

      expect(mockedComprimaAdapter.getAttachment).toBeCalledWith(
        expect.anything(),
        'bytes=0-100'
      );
      expect(res.status).toBe(206);
      expect(res.headers['content-range']).toBe('bytes 0-100/200');
      expect(res.headers['accept-ranges']).toBe('bytes');
    });

    it('transcodes MP4 and never forwards Range upstream', async () => {
      mockedComprimaAdapter.getDocument.mockResolvedValue(
        makeDocument('video/mp4')
      );
      mockedComprimaAdapter.getAttachment.mockResolvedValue({
        data: makeStream(),
        status: 200,
        headers: { 'content-type': 'video/mp4' },
      } as never);

      mockTranscodingFfmpeg();

      const res = await request(app.callback())
        .get('/document/1337/attachment')
        .set('Range', 'bytes=0-100');

      expect(mockedComprimaAdapter.getAttachment).toBeCalledWith(
        expect.anything(),
        undefined
      );
      expect(mockedSpawn).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('video/mp4');
    });

    it('passes through audio/mp4 without transcoding', async () => {
      mockedComprimaAdapter.getDocument.mockResolvedValue(
        makeDocument('audio/mp4')
      );
      mockedComprimaAdapter.getAttachment.mockResolvedValue({
        data: makeStream(),
        status: 200,
        headers: { 'content-type': 'audio/mp4' },
      } as never);

      const res = await request(app.callback()).get('/document/1337/attachment');

      // The core regression guard: audio-only files must never reach the
      // mandatory-video ffmpeg branch.
      expect(mockedSpawn).not.toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('audio/mp4');
    });

    it('transcodes no-MIME docs when the upstream content-type is video/mp4', async () => {
      mockedComprimaAdapter.getDocument.mockResolvedValue(makeDocument(''));
      mockedComprimaAdapter.getAttachment.mockResolvedValue({
        data: makeStream(),
        status: 200,
        headers: { 'content-type': 'video/mp4' },
      } as never);

      mockTranscodingFfmpeg();

      const res = await request(app.callback()).get('/document/1337/attachment');

      expect(mockedSpawn).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('video/mp4');
    });

    it('passes through no-MIME docs when the upstream content-type is audio/mp4', async () => {
      mockedComprimaAdapter.getDocument.mockResolvedValue(makeDocument(''));
      mockedComprimaAdapter.getAttachment.mockResolvedValue({
        data: makeStream(),
        status: 200,
        headers: { 'content-type': 'audio/mp4' },
      } as never);

      const res = await request(app.callback()).get('/document/1337/attachment');

      // Hardened header path: the old includes('mp4') would have transcoded this.
      expect(mockedSpawn).not.toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('audio/mp4');
    });
  });
});
