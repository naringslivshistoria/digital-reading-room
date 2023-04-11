import { Client } from '@elastic/elasticsearch';
import Axios from 'axios';
import config from '../../common/config';

const client = new Client({
  node: config.elasticSearch.url,
});

const ocrUrl = config.ocrUrl;

const supportedFormats = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'image/tif',
  'image/tiff',
  'image/webp',
];

const supportedExtensions = [
  '*.jpg',
  '*.jpeg',
  '*.png',
  '*.gif',
  '*.pdf',
  '*.tif',
  '*.tiff',
];

export const ocrNext = async () => {
  const next = await client.search({
    index: 'comprima',
    from: 0,
    size: 5,
    query: {
      bool: {
        must_not: {
          exists: {
            field: 'ocrText',
          },
        },
        must: {
          bool: {
            should: [
              {
                terms: { 'fields.format.value.keyword': supportedFormats },
              },
              {
                match: { 'pages.pageType': 'image' },
              },
              {
                match: { 'fields.filename.value': '*.jpg' },
              },
              {
                match: { 'fields.filename.value': '*.jpeg' },
              },
              {
                match: { 'fields.filename.value': '*.gif' },
              },
              {
                match: { 'fields.filename.value': '*.tif' },
              },
              {
                match: { 'fields.filename.value': '*.tiff' },
              },
              {
                match: { 'fields.filename.value': '*.pdf' },
              },
              {
                match: { 'fields.filename.value': '*.png' },
              },
            ],
          },
        },
      },
    },
  });

  if (next.hits.hits.length === 0) {
    console.log('No more documents to process');
    return null;
  } else {
    console.info('Found', next.hits.hits.length);
  }

  for (const document of next.hits.hits) {
    const nextDocumentId = document._id;
    console.info('Processing document', nextDocumentId);

    await Axios.get(ocrUrl + '/ocr/' + nextDocumentId);
  }

  return 1;
};
