import configPackage from '@iteam/config';

export interface Config {
  port: number;
  elasticSearch: {
    url: string;
    indexName: string;
  };
  comprimaAdapter: {
    url: string;
  };
  logLevel: string;
}

const config = configPackage({
  file: `${__dirname}/../config.json`,
  defaults: {
    port: 4003,
    elasticSearch: {
      url: 'http://localhost:9200',
      indexName: 'comprima',
    },
    comprimaAdapter: {
      url: 'http://localhost:4000',
    },
    logLevel: 'info',
  },
});

export default {
  port: config.get('port'),
  elasticSearch: config.get('elasticSearch'),
  comprimaAdapter: config.get('comprimaAdapter'),
  logLevel: config.get('logLevel'),
} as Config;
