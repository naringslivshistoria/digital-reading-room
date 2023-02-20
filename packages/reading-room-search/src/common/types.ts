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

export {
  Document,
  Field,
  Fields,
}