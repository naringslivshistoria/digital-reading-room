import configPackage from '@iteam/config'

interface Postgres {
  host: string
  user: string
  password: string
  database: string
  port: number
}

export interface Config {
  comprimaUrl: string
  mode: 'index' | 'update'
  logLevel: string
  postgres: Postgres
}

const config = configPackage({
  file: `${__dirname}/../config.json`,
  defaults: {
    comprimaUrl: 'http://localhost:4000',
    mode: 'index',
    logLevel: 'info',
    postgres: {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'postgres',
      database: 'crawler',
      port: 5433,
    },
  },
})

export default {
  comprimaUrl: config.get('comprimaUrl'),
  mode: config.get('mode'),
  logLevel: config.get('logLevel'),
  postgres: config.get('postgres'),
} as Config
