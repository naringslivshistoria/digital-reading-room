import { AttachmentType } from './types'

export const pageTypeDescriptions: Record<string, string> = {
  Image: 'Bild (Foton & Inscanningar)',
  Film: 'Ljud & Video',
  Text: 'Ljud & Video',
  Unknown: 'Ljud & Video',
  PDF: 'Dokument',
  Word: 'Dokument',
  Powerpoint: 'Dokument',
  Excel: 'Dokument',
}

export const pageTypeToAttachmentType: Record<string, AttachmentType> = {
  image: 'Dokument (inscannat)',
  film: 'Ljud & video',
  text: 'Ljud & video',
  unknown: 'Ljud & video',
  pdf: 'Dokument (pdf, doc, mm...)',
  word: 'Dokument (pdf, doc, mm...)',
  powerpoint: 'Dokument (pdf, doc, mm...)',
  excel: 'Dokument (pdf, doc, mm...)',
}
