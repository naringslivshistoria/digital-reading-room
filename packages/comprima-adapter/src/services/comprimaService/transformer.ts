import {
  Fields,
  Document,
} from '../../common/types'

const transformDocuments = (xmlDocuments: any[]) : Document[] => {
  const documents = xmlDocuments.map((xmlDocument : any) : Document => {
    const document = transformDocument(xmlDocument)
    return document
  })

  return documents
}

interface IndexName {
  [key: string]: string
}

const indexTranslatedNames : IndexName = {
  'motivid': 'motiveId',
  'filnamn': 'filename',
  'rubrik': 'title',
  'vidare-beskrivning': 'description',
  'originaltext': 'originalText',
  'kommentar': 'comment',
  'tidpunkt': 'time',
  'kreatörnamn': 'creator',
  'yrke': 'occupation',
  'kreatör-adress': 'creatorAddress',
  'kreatör-ort': 'creatorCity',
  'kreatör-land': 'creatorCountry',
  'firma': 'company',
  'geografisk-plats': 'location',
  'gatunummer': 'streetNumber',
  'fastighet': 'property',
  'kvarter': 'block',
  'församling': 'parish',
  'område-mindre': 'areaMinor',
  'område-större': 'areaMajor',
  'ort': 'city',
  'kommun': 'municipality',
  'län': 'region',
  'land': 'country',
  'gata-2': 'street2',
  'gatunummer-2': 'streetNumber2',
  'fastighet-2': 'property2',
  'kvarter-2': 'block2',
  'deponent': 'depositor',
  'arkivbildare': 'archiveInitiator',
  'seriesignum': 'seriesSignature',
  'serie': 'seriesName',
  'volym': 'volume',
  'taggar': 'tags',
  'title': 'englishTitle',
  'description': 'englishDescription',
  'publicerad': 'published',
  'rättigheter': 'rights',
  'album': 'album',
  'förvaring/ordning': 'storage',
  'mediabärare': 'mediaCarrier',
  'ursprungsid': 'originId',
  'format': 'format',
  'upplösning': 'resolution',
  'språk': 'language',
  'objektid': 'objectId',
  'färgkodning': 'colorCode',
  'negativ': 'negative',
  'typ': 'type',
  'mime': 'mimeType',
  'längd': 'length',
  'gata': 'street',
  'version': 'version',
  '1': 'motiveId',
  '2': 'filename',
  '3': 'title',
  '4': 'description',
  '5': 'originalText',
  '6': 'comment',
  '7': 'time',
  '8': 'creator',
  '9': 'creatorName',
  '10': 'creatorOccupation',
  '11': 'creatorAddress',
  '12': 'creatorCity',
  '13': 'creatorCountry',
  '14': 'company',
  '15': 'location',
  '16': 'street',
  '17': 'streetNumber',
  '18': 'property',
  '19': 'block',
  '20': 'parish',
  '21': 'areaMinor',
  '22': 'areaMajor',
  '23': 'city',
  '24': 'municipality',
  '25': 'region',
  '26': 'country',
  '27': 'street2',
  '28': 'streetNumber2',
  '29': 'property2',
  '30': 'block2',
  '31': 'depositor',
  '32': 'archiveInitiator',
  '33': 'seriesSignature',
  '34': 'seriesName',
  '35': 'volume',
  '36': 'tags',
  '37': 'englishTitle',
  '38': 'englishDescription',
  '39': 'properties',
  '40': 'published',
  '41': 'rights',
  '42': 'album',
  '43': 'storage',
  '44': 'mediaCarrier',
  '45': 'originId',
  '46': 'format',
  '47': 'resolution',
  '48': 'language',
  '49': 'objectId',
  '50': 'unknown47',
  '51': 'unknown48',
  '52': 'type',
  '53': 'mimeType',
  '54': 'unknown54',
  '55': 'unknown55',
}

const getIndexName = (indexName: string) : string => {
  let name = indexTranslatedNames[indexName]
  if (!name) {
    console.error("No translation for", indexName)
    name = indexName
  }

  return name
}

const transformDocument = (xmlDocument : any) : Document => {
  const fields : Fields = {}

  xmlDocument.Indices.Index.forEach((index : any) => {
    const translationKey = index.FieldName?.toLowerCase().replace(' ', '-') ?? index.Number
    const indexName = getIndexName(translationKey)
    fields[indexName] = {
      id: index.Number,
      originalName: index.FieldName,
      value: index.Value,
    }
  })

  return {
    id: xmlDocument.Id,
    documentState: xmlDocument.DocumentState,
    fields,
    pages: [ {
      pageType: xmlDocument.Pages.Page.PageType,
      url: xmlDocument.Pages.Page.Data,
      thumbnailUrl: xmlDocument.Pages.Page.ThumbnailData,
    }]
  }
}

export default {
  transformDocuments,
  transformDocument
}