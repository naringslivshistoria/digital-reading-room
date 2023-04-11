import configPackage from '@iteam/config';

interface Postgres {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

export interface Config {
  attempts: number;
  comprimaAdapter: {
    url: string;
  };
  elasticSearch: {
    url: string;
    indexName: string;
  };
  logLevel: string;
  mode: 'index' | 'update' | 'ocr';
  ocrUrl: string;
  postgres: Postgres;
}

const config = configPackage({
  file: `${__dirname}/../config.json`,
  defaults: {
    attempts: 10,
    comprimaAdapter: {
      url: 'http://localhost:4000',
    },
    elasticSearch: {
      url: 'http://localhost:9200',
      indexName: 'comprima',
    },
    logLevel: 'info',
    mode: 'index',
    ocrUrl: 'http://localhost:4003',
    postgres: {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'postgres',
      database: 'crawler',
      port: 5433,
    },
  },
});

export default {
  attempts: config.get('attempts'),
  comprimaAdapter: config.get('comprimaAdapter'),
  elasticSearch: config.get('elasticSearch'),
  logLevel: config.get('logLevel'),
  mode: config.get('mode'),
  ocrUrl: config.get('ocrUrl'),
  postgres: config.get('postgres'),
} as Config;
