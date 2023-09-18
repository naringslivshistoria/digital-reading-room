import Tesseract from 'tesseract.js'
import pdf2image from 'pdf-img-convert'
const { createScheduler, createWorker } = Tesseract
import log from '../../common/log'
import { create } from 'ts-node'

const languages = [/*"eng",*/ 'swe']

const NUM_WORKERS = 5

let scheduler: Tesseract.Scheduler | null = null
let worker: Tesseract.Worker | null = null

const initialize = async () => {
  try {
    scheduler = createScheduler()

    for (let i = 0; i < NUM_WORKERS; i++) {
      const worker = await initializeWorker()
      scheduler.addWorker(worker)
    }
  } catch (error: any) {
    log.error('Error creating scheduler', error)
    throw error
  }
}

const initializeWorker = async () => {
  try {
    worker = await createWorker()

    await worker.loadLanguage(languages.join('+')).catch((error: any) => {
      log.error('Error loading language', error)
    })
    await worker.initialize(languages.join('+')).catch((error: any) => {
      log.error('Error initializing worker', error)
    })
    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
    })

    return worker
  } catch (error: any) {
    log.error('Error initializing worker', error)
    throw error
  }
}

const terminateWorker = async () => {
  await worker?.terminate()
}

const ocrImage = async (fileData: ArrayBuffer) => {
  if (scheduler) {
    const {
      data: { text },
    } = await scheduler.addJob('recognize', fileData) //await worker.recognize(fileData)
    console.debug(text)

    // Remove hyphenation in words
    return text.replaceAll('-\n', '')
  } else {
    throw new Error('Workers not initalized')
  }
}

const convertToImages = async (fileData: ArrayBuffer) => {
  return await pdf2image.convert(new Uint8Array(fileData), {
    width: 3000,
    height: 3000,
    scale: 2,
  })
}

export default async (fileData: ArrayBuffer, type: string) => {
  if (!scheduler) {
    log.info('Creating OCR scheduler...')
    await initialize()
  }

  log.info(`Parsing attachment of type ${type}`)

  if (type.toLowerCase().endsWith('pdf')) {
    log.info('Will try parsing this document as PDF...')
    return tryParsePdf(fileData)
  } else if (type.toLocaleLowerCase().endsWith('octet-stream')) {
    log.info(
      'Will try parsing this document as PDF and if that does not work, will try parsing it as an image...'
    )
    return tryParsePdf(fileData).catch(() => tryParseImage(type, fileData))
  } else {
    log.info('Will try parsing this document as an image...')
    return tryParseImage(type, fileData)
  }
}

const tryParseImage = async (type: string, fileData: ArrayBuffer) => {
  try {
    return await ocrImage(fileData)
  } catch (error: any) {
    log.error(`Error OCR:ing attachment of type ${type}`, error)
    return ''
  }
}

const tryParsePdf = async (fileData: ArrayBuffer) => {
  const images = await convertToImages(fileData)
  log.info(`Got ${images.length} pages`)
  let text = ''
  let counter = 0

  for (const image of images) {
    if (typeof image !== 'string') {
      log.info(`indexing page ${counter++}`)
      text += await ocrImage(image.buffer)
    } else {
      log.error(`Unexpected error while converting from pdf: ${image}`)
    }
  }

  return text
}
