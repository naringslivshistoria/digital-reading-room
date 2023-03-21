export interface Level {
  id: string
  level: number

  archivist: string
  depositor: string
  created: Date

  crawled?: Date
  error?: string

  failed: number
  successful: number
}