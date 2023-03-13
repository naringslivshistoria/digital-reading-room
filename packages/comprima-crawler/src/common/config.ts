import configPackage from '@iteam/config'

export interface Config {
  comprimaUrl: string
  concurrency: number
  retryDelay: number
}

const config = configPackage({
  file: `${__dirname}/../config.json`,
  defaults: {
    comprimaUrl: 'http://localhost:4000',
    concurrency: 2,
    retryDelay: 2
  },
})

export default {
  comprimaUrl: config.get('comprimaUrl'),
  concurrency: config.get('concurrency'),
  retryDelay: config.get('retryDelay'),
} as Config