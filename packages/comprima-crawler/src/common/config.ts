import configPackage from '@iteam/config'

export interface CrawlerConfig {
  batchSize: number
  concurrency: number
  retryCount: number
  retryDelay: number
}

export interface Config {
  comprimaUrl: string
  crawler: CrawlerConfig
  mode: 'index' | 'update'
  levels: string
  logLevel: string
}

const config = configPackage({
  file: `${__dirname}/../config.json`,
  defaults: {
    comprimaUrl: 'http://localhost:4000',
    crawler: {
      batchSize: 10,
      concurrency: 1,
      retryCount: 1,
      retryDelay: 5,
    },
    mode: 'index',
    levels: '41000-41080,42000-42002',
    logLevel: 'info',
  },
})

export default {
  comprimaUrl: config.get('comprimaUrl'),
  crawler: config.get('crawler'),
  mode: config.get('mode'),
  levels: config.get('levels'),
  logLevel: config.get('logLevel'),
} as Config
