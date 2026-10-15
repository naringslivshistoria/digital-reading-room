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
  corsOrigin: string
  postgres: Postgres
  auth: {
    secret: string
    expiresIn: number
    maxFailedLoginAttempts: number
    cookieName: string
    cookieDomain: string
    cookieSecure: boolean
  }
  llm: {
    baseUrl: string
    apiKey: string
    model: string
    systemPrompt: string
  }
}

const config = configPackage({
  file: `${__dirname}/../../config.json`,
  defaults: {
    port: 4010,
    corsOrigin: 'http://localhost:5173',
    postgres: {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'postgrespassword',
      database: 'readingroom',
      port: 5433,
    },
    auth: {
      secret: 'dev-secret-change-me',
      expiresIn: 10800, // seconds
      maxFailedLoginAttempts: 3,
      cookieName: 'foretagskallan',
      cookieDomain: 'localhost',
      cookieSecure: false,
    },
    llm: {
      // Any OpenAI-compatible provider within the EU (e.g. Azure OpenAI v1, Berget, vLLM)
      baseUrl: 'http://localhost:8000/v1',
      apiKey: '',
      model: '',
      systemPrompt:
        'Du är Företagskällan, en assistent som hjälper elever att utforska svensk näringslivshistoria. Svara på svenska.',
    },
  },
})

export default {
  port: config.get('port'),
  corsOrigin: config.get('corsOrigin'),
  postgres: config.get('postgres'),
  auth: config.get('auth'),
  llm: config.get('llm'),
} as Config
