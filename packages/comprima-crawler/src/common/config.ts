import configPackage from '@iteam/config'

export interface CrawlerConfig {
  concurrency: number
  retryCount: number
  retryDelay: number
}

export interface Config {
  comprimaUrl: string
  crawler: CrawlerConfig
  levels: string
  logLevel: string
}

const config = configPackage({
  file: `${__dirname}/../config.json`,
  defaults: {
    comprimaUrl: 'http://localhost:4000',
    crawler: {
      concurrency: 2,
      retryCount: 2,
      retryDelay: 2,
    },
    levels: '41000-41080,42000-42002',
    logLevel: 'info',
  },
})

export default {
  comprimaUrl: config.get('comprimaUrl'),
  crawler: config.get('crawler'),
  levels: config.get('levels'),
  logLevel: config.get('logLevel'),
} as Config
