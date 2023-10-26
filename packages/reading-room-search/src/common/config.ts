import configPackage from '@iteam/config'

interface Postgres {
  host: string
  user: string
  password: string
  database: string
  port: number
}

export interface Config {
  port: number
  postgres: Postgres
  auth: {
    secret: string
    expiresIn: string
    maxFailedLoginAttempts: number
  }
  elasticSearch: {
    url: string
    indexName: string
  }
  comprimaAdapter: {
    url: string
  }
  smtp: {
    host: string
    port: number
    tls: boolean
    user: string
    password: string
  }
}

const config = configPackage({
  file: `${__dirname}/../config.json`,
  defaults: {
    port: 4001,
    postgres: {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'postgrespassword',
      database: 'readingroom',
      port: 5433,
    },
    auth: {
      secret:
        'Kungen, Drottningen, Kronprinsessan och Prins Daniel höll i dag ett videomöte med Kungl. Vetenskapsakademien.',
      expiresIn: '3h', // format allowed by https://github.com/zeit/ms
      maxFailedLoginAttempts: 3,
    },
    elasticSearch: {
      url: 'http://localhost:9200',
      indexName: 'comprima',
    },
    comprimaAdapter: {
      url: 'http://localhost:4000',
    },
    smtp: {
      port: 587,
      tls: true,
    },
  },
})

export default {
  auth: config.get('auth'),
  port: config.get('port'),
  postgres: config.get('postgres'),
  elasticSearch: config.get('elasticSearch'),
  comprimaAdapter: config.get('comprimaAdapter'),
  smtp: config.get('smtp'),
} as Config
