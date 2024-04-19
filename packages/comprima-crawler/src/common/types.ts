export interface Level {
  id: string
  level: number

  archivist: string
  depositor: string
  created: Date

  attempts: number
  crawled?: Date
  error?: string | null

  failed: number
  successful: number
}

export interface Field {
  id: number
  originalName: string
  value: string
}

export interface Fields {
  [key: string]: Field
}

export interface Page {
  pageType: string
  url: string
  thumbnailUrl?: string
}

export interface Document {
  id: number
  documentState: string
  fields: Fields
  level?: string
  pages: [Page]
}

export type AttachmentType =
  | 'Foto'
  | 'Dokument (inscannat)'
  | 'Ljud & video'
  | 'Dokument (pdf, doc, mm...)'
  | undefined
