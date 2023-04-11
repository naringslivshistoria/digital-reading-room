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
  await initializeWorker();

  if (type.toLowerCase().endsWith('pdf')) {
    const images = await convertToImages(fileData);
    log.info(`Got ${images.length} pages`);
    let text = '';
    let counter = 0;

    for (const image of images) {
      if (typeof image !== 'string') {
        log.info(`indexing page ${counter++}`);
        text += await ocrImage(image.buffer);
      } else {
        console.error('Unexpected error while converting from pdf', image);
      }
    }

    await terminateWorker();

    return text;
  } else {
    try {
      return await ocrImage(fileData);
    } catch (error: any) {
      log.error(`Error OCR:ing attachment of type ${type}`, error);
      return '';
    }
  }
};
