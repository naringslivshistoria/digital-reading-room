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
  image: 'Inscanning',
  film: 'Ljud & Video',
  text: 'Ljud & Video',
  unknown: 'Ljud & Video',
  pdf: 'Dokument',
  word: 'Dokument',
  powerpoint: 'Dokument',
  excel: 'Dokument',
}
