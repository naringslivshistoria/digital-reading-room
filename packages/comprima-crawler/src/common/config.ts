import configPackage from '@iteam/config'

export interface Config {
  comprimaUrl: string
  concurrency: number
  levels: string
  logLevel: string
  retryCount: number
  retryDelay: number
}

const config = configPackage({
  file: `${__dirname}/../config.json`,
  defaults: {
    comprimaUrl: 'http://localhost:4000',
    concurrency: 2,
    levels: '41000-41080,42000-42002',
    logLevel: 'info',
    retryCount: 2,
    retryDelay: 2
  },
})

export default {
  comprimaUrl: config.get('comprimaUrl'),
  concurrency: config.get('concurrency'),
  levels: config.get('levels'),
  logLevel: config.get('logLevel'),
  retryCount: config.get('retryCount'),
  retryDelay: config.get('retryDelay'),
} as Config
