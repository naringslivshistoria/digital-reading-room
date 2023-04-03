import Tesseract from 'tesseract.js'
import pdf2image from 'pdf-img-convert'
const { createWorker } = Tesseract
import fs from 'fs'

const languages = [/*"eng",*/ "swe"]
const supportedFormats = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "pdf",
  "tif",
  "tiff",
  "webp",
]

let worker : Tesseract.Worker | null = null

const initializeWorker = async () => {
  worker = await createWorker()
  await worker.loadLanguage(languages.join('+'))
  await worker.initialize(languages.join('+'))
  worker.setParameters({
    tessedit_pageseg_mode: Tesseract.PSM.AUTO
  })
}

const terminateWorker = async () => {
  await worker?.terminate()
}

const ocrImage = async (fileData: ArrayBuffer) => {
  if (worker) {
    const { data: { text } } = await worker.recognize(fileData)
    console.debug(text)

    // Remove hyphenation in words
    return text.replaceAll('-\n', '')
  } else {
    throw new Error('Worker not initalized')
  }
}

const convertToImages = async (fileData: ArrayBuffer) => {
  return await pdf2image.convert(new Uint8Array(fileData), 
    { width: 3000, height: 3000, scale: 2})
}

export default async (fileData: ArrayBuffer, type: string) => {
  if (type.toLowerCase().endsWith('pdf')) {
    await initializeWorker()

    const images = await convertToImages(fileData)
    console.info('Got', images.length, 'pages')
    let text = ''
    let counter = 0

    for (const image of images) {
      if (typeof(image) !== 'string') {
        console.info('indexing page', counter++)
        text += await ocrImage(image.buffer)
      } else {
        console.error('Unexpected error while converting from pdf', image)
      }
    }

    await terminateWorker()

    return text
  } else {
    try {
      return await ocrImage(fileData)
    } catch (error) {
      console.error('Error OCR:ing attachment of type', type)
      return ''
    }
  }
}
