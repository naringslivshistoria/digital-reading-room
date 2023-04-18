import Tesseract from 'tesseract.js';
import pdf2image from 'pdf-img-convert';
const { createWorker } = Tesseract;
import log from '../../common/log';

const languages = [/*"eng",*/ 'swe'];

let worker: Tesseract.Worker | null = null;

const initializeWorker = async () => {
  try {
    worker = await createWorker();

    await worker.loadLanguage(languages.join('+')).catch((error: any) => {
      log.error('Error loading language', error);
    });
    await worker.initialize(languages.join('+')).catch((error: any) => {
      log.error('Error initializing worker', error);
    });
    worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
    });
  } catch (error: any) {
    log.error('Error initializing worker', error);
  }
};

const terminateWorker = async () => {
  await worker?.terminate();
};

const ocrImage = async (fileData: ArrayBuffer) => {
  if (worker) {
    const {
      data: { text },
    } = await worker.recognize(fileData);
    console.debug(text);

    // Remove hyphenation in words
    return text.replaceAll('-\n', '');
  } else {
    throw new Error('Worker not initalized');
  }
};

const convertToImages = async (fileData: ArrayBuffer) => {
  return await pdf2image.convert(new Uint8Array(fileData), {
    width: 3000,
    height: 3000,
    scale: 2,
  });
};

export default async (fileData: ArrayBuffer, type: string) => {
  log.info('Initializing OCR worker...');
  await initializeWorker();

  log.info(`Parsing attachment of type ${type}`);

  if (type.toLowerCase().endsWith('pdf')) {
    log.info('Will try parsing this document as PDF...');
    return tryParsePdf(fileData);
  } else if (type.toLocaleLowerCase().endsWith('octet-stream')) {
    log.info(
      'Will try parsing this document as PDF and if that does not work, will try parsing it as an image...'
    );
    return tryParsePdf(fileData).catch(() => tryParseImage(type, fileData));
  } else {
    log.info('Will try parsing this document as an image...');
    return tryParseImage(type, fileData);
  }
};

const tryParseImage = async (type: string, fileData: ArrayBuffer) => {
  try {
    return await ocrImage(fileData);
  } catch (error: any) {
    log.error(`Error OCR:ing attachment of type ${type}`, error);
    return '';
  }
};

const tryParsePdf = async (fileData: ArrayBuffer) => {
  const images = await convertToImages(fileData);
  log.info(`Got ${images.length} pages`);
  let text = '';
  let counter = 0;

  for (const image of images) {
    if (typeof image !== 'string') {
      log.info(`indexing page ${counter++}`);
      text += await ocrImage(image.buffer);
    } else {
      log.error(`Unexpected error while converting from pdf: ${image}`);
    }
  }

  await terminateWorker();

  return text;
};
