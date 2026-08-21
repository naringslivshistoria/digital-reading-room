import request from 'supertest';
import Koa from 'koa';
import KoaRouter from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { Readable, PassThrough } from 'stream';
import { EventEmitter } from 'events';
import { createServer, Server } from 'http';
import { spawn } from 'child_process';
import { createWriteStream, createReadStream, unlink } from 'fs';
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
const mockedCreateReadStream = jest.mocked(createReadStream);
const mockedUnlink = jest.mocked(unlink);

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

// A partial video body: 206 + content-range, i.e. a slice ffmpeg must never see.
const partialVideoResponse = (data: Readable) => ({
  data,
  status: 206,
  headers: {
    'content-type': 'video/mp4',
    'content-range': 'bytes 0-100/2000',
  },
});

// Collects whatever the transcode branch buffers to its temp file, so a test can
// assert which body actually reached ffmpeg. Call after mockTranscodingFfmpeg().
const captureBufferedFile = () => {
  const chunks: Buffer[] = [];
  mockedCreateWriteStream.mockImplementation((): never => {
    const ws = new PassThrough();
    ws.on('data', (chunk) => chunks.push(chunk as Buffer));
    return ws as never;
  });
  return () => Buffer.concat(chunks).toString();
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

// Wires up a spawn that fails the way a missing ffmpeg binary does: an 'error'
// event followed by stdout ending without ever producing data.
const mockMissingFfmpeg = () => {
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
      child.emit('error', new Error('spawn ffmpeg ENOENT'));
      child.stdout.end();
    });
    return child as never;
  });
};

const flushEvents = () => new Promise((resolve) => setTimeout(resolve, 20));

// Tests that tear the response down mid-flight leave sockets supertest never
// closes, which keeps the jest worker alive. Own the server so we can close it.
const withServer = async (fn: (server: Server) => Promise<void>) => {
  const server = createServer(app.callback());
  await new Promise<void>((resolve) => server.listen(0, resolve));
  try {
    await fn(server);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
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

    it('re-fetches without Range when a no-format doc turns out to be a 206 video/mp4', async () => {
      mockedComprimaAdapter.getDocument.mockResolvedValue(makeDocument(''));
      const partial = makeStream('partial-slice');
      mockedComprimaAdapter.getAttachment
        .mockResolvedValueOnce(partialVideoResponse(partial) as never)
        .mockResolvedValueOnce({
          data: makeStream('full-body'),
          status: 200,
          headers: { 'content-type': 'video/mp4' },
        } as never);

      mockTranscodingFfmpeg();
      const buffered = captureBufferedFile();

      const res = await request(app.callback())
        .get('/document/1337/attachment')
        .set('Range', 'bytes=0-100');

      // The Range is forwarded on the first hop (format is empty, so the doc is
      // not yet known to be a video), then re-fetched in full once the upstream
      // content-type flips it into the transcode branch.
      expect(mockedComprimaAdapter.getAttachment).toHaveBeenCalledTimes(2);
      expect(mockedComprimaAdapter.getAttachment).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        'bytes=0-100'
      );
      expect(mockedComprimaAdapter.getAttachment).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        undefined
      );
      // Only the complete second body may reach ffmpeg.
      expect(partial.destroyed).toBe(true);
      expect(buffered()).toBe('full-body');
      expect(mockedSpawn).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('fails closed without transcoding when the re-fetch is still partial', async () => {
      mockedComprimaAdapter.getDocument.mockResolvedValue(makeDocument(''));
      // Two distinct bodies: sharing one stream would let the second destroy()
      // pass vacuously and leave the 502 path's socket cleanup unguarded.
      const first = makeStream('partial-one');
      const second = makeStream('partial-two');
      mockedComprimaAdapter.getAttachment
        .mockResolvedValueOnce(partialVideoResponse(first) as never)
        .mockResolvedValueOnce(partialVideoResponse(second) as never);

      mockTranscodingFfmpeg();

      const res = await request(app.callback())
        .get('/document/1337/attachment')
        .set('Range', 'bytes=0-100');

      expect(mockedComprimaAdapter.getAttachment).toHaveBeenCalledTimes(2);
      expect(mockedSpawn).not.toHaveBeenCalled();
      // Both discarded bodies must be destroyed or the upstream sockets leak.
      expect(first.destroyed).toBe(true);
      expect(second.destroyed).toBe(true);
      expect(res.status).toBe(502);
      expect(res.body.documentId).toBe('1337');
    });

    it('does not re-fetch when no Range was forwarded and upstream is partial anyway', async () => {
      mockedComprimaAdapter.getDocument.mockResolvedValue(
        makeDocument('video/mp4')
      );
      const partial = makeStream('partial-slice');
      mockedComprimaAdapter.getAttachment.mockResolvedValue(
        partialVideoResponse(partial) as never
      );

      mockTranscodingFfmpeg();

      const res = await request(app.callback()).get('/document/1337/attachment');

      // Range is withheld for a doc already known to be video, so a Range-less
      // retry is byte-for-byte the same request — it would pull a whole video
      // again only to fail identically. Fail closed on the first response.
      expect(mockedComprimaAdapter.getAttachment).toHaveBeenCalledTimes(1);
      expect(mockedComprimaAdapter.getAttachment).toHaveBeenCalledWith(
        expect.anything(),
        undefined
      );
      expect(partial.destroyed).toBe(true);
      expect(mockedSpawn).not.toHaveBeenCalled();
      expect(res.status).toBe(502);
    });

    it('treats a content-range on a 200 as a partial body', async () => {
      mockedComprimaAdapter.getDocument.mockResolvedValue(makeDocument(''));
      const partial = makeStream('partial-slice');
      mockedComprimaAdapter.getAttachment
        .mockResolvedValueOnce({
          ...partialVideoResponse(partial),
          // A non-compliant upstream can answer 200 while still sending a slice.
          status: 200,
        } as never)
        .mockResolvedValueOnce({
          data: makeStream('full-body'),
          status: 200,
          headers: { 'content-type': 'video/mp4' },
        } as never);

      mockTranscodingFfmpeg();
      const buffered = captureBufferedFile();

      const res = await request(app.callback())
        .get('/document/1337/attachment')
        .set('Range', 'bytes=0-100');

      expect(mockedComprimaAdapter.getAttachment).toHaveBeenCalledTimes(2);
      expect(partial.destroyed).toBe(true);
      expect(buffered()).toBe('full-body');
      expect(mockedSpawn).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('re-derives the content type from the re-fetched response', async () => {
      mockedComprimaAdapter.getDocument.mockResolvedValue(makeDocument(''));
      mockedComprimaAdapter.getAttachment
        .mockResolvedValueOnce(
          partialVideoResponse(makeStream('partial-slice')) as never
        )
        .mockResolvedValueOnce({
          data: makeStream('audio-body'),
          status: 200,
          headers: { 'content-type': 'audio/mp4' },
        } as never);

      mockTranscodingFfmpeg();

      const res = await request(app.callback())
        .get('/document/1337/attachment')
        .set('Range', 'bytes=0-100');

      // The transcode decision must describe the body we are about to serve, not
      // the discarded one: hop 2 is audio-only, so it passes through untouched
      // instead of being fed to the mandatory-video ffmpeg map.
      expect(mockedSpawn).not.toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('audio/mp4');
    });

    it('creates the temp file owner-only', async () => {
      mockedComprimaAdapter.getDocument.mockResolvedValue(
        makeDocument('video/mp4')
      );
      mockedComprimaAdapter.getAttachment.mockResolvedValue({
        data: makeStream(),
        status: 200,
        headers: { 'content-type': 'video/mp4' },
      } as never);

      mockTranscodingFfmpeg();

      await request(app.callback()).get('/document/1337/attachment');

      // The buffered file may hold restricted archive content.
      expect(mockedCreateWriteStream).toHaveBeenCalledWith(expect.any(String), {
        mode: 0o600,
      });
    });

    it('removes the temp file and never spawns ffmpeg when buffering fails', async () => {
      mockedComprimaAdapter.getDocument.mockResolvedValue(
        makeDocument('video/mp4')
      );
      mockedComprimaAdapter.getAttachment.mockResolvedValue({
        data: new PassThrough(),
        status: 200,
        headers: { 'content-type': 'video/mp4' },
      } as never);

      mockedCreateWriteStream.mockImplementation((): never => {
        const ws = new PassThrough();
        setImmediate(() => ws.emit('error', new Error('disk full')));
        return ws as never;
      });

      const res = await request(app.callback()).get('/document/1337/attachment');

      expect(res.status).toBe(500);
      expect(mockedUnlink).toHaveBeenCalled();
      expect(mockedSpawn).not.toHaveBeenCalled();
    });

    it('serves the buffered file when ffmpeg cannot be spawned', async () => {
      mockedComprimaAdapter.getDocument.mockResolvedValue(
        makeDocument('video/mp4')
      );
      mockedComprimaAdapter.getAttachment.mockResolvedValue({
        data: makeStream(),
        status: 200,
        headers: { 'content-type': 'video/mp4' },
      } as never);

      mockMissingFfmpeg();
      // A real file read delivers asynchronously, i.e. after ffmpeg's stdout
      // has already ended — which is what makes the end-race observable.
      mockedCreateReadStream.mockImplementation((): never => {
        const rs = new PassThrough();
        setTimeout(() => rs.end('fallback-bytes'), 5);
        return rs as never;
      });

      await withServer(async (server) => {
        const res = await request(server)
          .get('/document/1337/attachment')
          .buffer(true);

        // Regression guard: piping ffmpeg's (immediately ended) stdout with the
        // default end:true would close the response before the fallback flowed.
        expect(res.status).toBe(200);
        expect((res.body as Buffer).toString()).toContain('fallback-bytes');
        expect(mockedUnlink).toHaveBeenCalled();
      });
    });

    it('does not hang when the fallback read stream fails', async () => {
      mockedComprimaAdapter.getDocument.mockResolvedValue(
        makeDocument('video/mp4')
      );
      mockedComprimaAdapter.getAttachment.mockResolvedValue({
        data: makeStream(),
        status: 200,
        headers: { 'content-type': 'video/mp4' },
      } as never);

      mockMissingFfmpeg();
      mockedCreateReadStream.mockImplementation((): never => {
        const rs = new PassThrough();
        setImmediate(() => rs.emit('error', new Error('read failed')));
        return rs as never;
      });

      await withServer(async (server) => {
        try {
          await request(server).get('/document/1337/attachment');
        } catch {
          /* the response is torn down; either outcome is fine, it must not hang */
        }

        await flushEvents();
        expect(mockedUnlink).toHaveBeenCalled();
      });
    });

    it('cleans up without transcoding when the client disconnects while buffering', async () => {
      mockedComprimaAdapter.getDocument.mockResolvedValue(
        makeDocument('video/mp4')
      );
      mockedComprimaAdapter.getAttachment.mockResolvedValue({
        data: new PassThrough(),
        status: 200,
        headers: { 'content-type': 'video/mp4' },
      } as never);

      // Never emits 'finish', so the request stays stuck in the buffering phase.
      mockedCreateWriteStream.mockImplementation(
        () => new PassThrough() as never
      );

      await withServer(async (server) => {
        const req = request(server).get('/document/1337/attachment');
        setTimeout(() => req.abort(), 50);
        try {
          await req;
        } catch {
          /* client-side abort */
        }

        await flushEvents();
        expect(mockedUnlink).toHaveBeenCalled();
        expect(mockedSpawn).not.toHaveBeenCalled();
      });
    });
  });
});
