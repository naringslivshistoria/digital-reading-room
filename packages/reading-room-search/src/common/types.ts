interface Field {
  id: number,
  originalName: string
  value: string
}

interface Fields {
  [key: string]: Field
}

interface Page {
  pageType: string,
  url: string,
  thumbnailUrl: string,
}

interface Document {
  id: number,
  documentState: string,
  fields: Fields,
  pages: [Page]
}

interface User {
  id: number
  username: string
  locked: boolean
  disabled: boolean
  passwordHash: string
  salt: string
  failedLoginAttempts: number
}

export {
  Document,
  Field,
  Fields,
  User,
}