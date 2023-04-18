import { Client } from '@elastic/elasticsearch';
import { promises as fs } from 'fs';
import { Document } from '../../common/types';
import axios, { AxiosError } from 'axios';

const ELASTICSEARCH_URL =
  process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

const client = new Client({
  node: ELASTICSEARCH_URL,
});

const thumbnailTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/apng',
  'image/avif',
  'image/svg',
  'image/svg+xml',
];

const maxContentLengthMB = process.env.THUMBNAIL_MAX_SIZE_MB || '20';
const maxContentLength = parseInt(maxContentLengthMB) * 1_000_000;

const saveThumbnail = async (document: Document) => {
  if (document.pages[0].thumbnailUrl) {
    try {
      const response = await axios.get(document.pages[0].thumbnailUrl, {
        responseType: 'arraybuffer',
        maxContentLength,
      });

      if (
        thumbnailTypes.includes(response.headers['content-type'].toLowerCase())
      ) {
        await fs.writeFile(
          process.cwd() + '/../thumbnails/' + document.id + '.jpg',
          response.data,
          'binary'
        );
        return true;
      } else {
        console.error(
          'Rejected thumbnail type',
          response.headers['content-type'].toLowerCase()
        );
      }
    } catch (error: AxiosError | any) {
      const errorString = error.toString();

      if (errorString.includes('maxContentLength size of')) {
        console.debug(
          'Aborting download of oversized thumbnail file',
          errorString
        );
        return true;
      }

      console.error(error);
      return false;
    }
  }

  return false;
};

const indexDocument = async (document: Document) => {
  try {
    const hasValidThumbnail = await saveThumbnail(document);

    if (!hasValidThumbnail) {
      document.pages[0].thumbnailUrl = undefined;
    }

    await client.index({
      index: 'comprima',
      id: document.id.toString(),
      document,
    });
  } catch (err) {
    console.error(err);
  }
};

const healthCheck = async () => {
  await axios.get(ELASTICSEARCH_URL + '/_cluster/health');
};

export default {
  healthCheck,
  indexDocument,
};
