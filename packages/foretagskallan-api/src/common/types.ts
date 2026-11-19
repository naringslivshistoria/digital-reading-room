// Mirrors the users table owned by reading-room-search (the migrations live there).
export interface User {
  id: string // uuid
  username: string
  passwordHash: string
  salt: string
  locked: boolean
  disabled: boolean
  failedLoginAttempts: number
  depositors: string[]
  archiveInitiators: string[]
  series: string[]
  volumes: string[]
  documentIds: string[]
  fileNames: string[]
  firstName: string | null
  lastName: string | null
  organization: string | null
  platforms: string[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
