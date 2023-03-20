import configPackage from '@iteam/config'

export interface Config {
  batchSize: number
  comprimaUrl: string
  mode: 'index' | 'update'
  logLevel: string
}

const config = configPackage({
  file: `${__dirname}/../config.json`,
  defaults: {
    batchSize: 2,
    comprimaUrl: 'http://localhost:4000',
    mode: 'index',
    logLevel: 'info',
  },
})

export default {
  batchSize: config.get('batchSize'),
  comprimaUrl: config.get('comprimaUrl'),
  mode: config.get('mode'),
  logLevel: config.get('logLevel'),
} as Config
