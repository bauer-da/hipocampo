import path from 'path'

import { config } from 'dotenv'

config({
  path: path.join(process.cwd(), '.env'),
})

const ensureVariable = (variableName: string, value: string | undefined) => {
  if (!value) {
    throw new Error(
      `${variableName} env variable is required, but value is ${JSON.stringify(
        value
      )}`
    )
  }

  return value
}

const {
  DKIM_DOMAIN_NAME,
  DKIM_KEY_SELECTOR,
  DKIM_PRIVATE_KEY,
  MAIL_HOST,
  MAIL_PASSWORD,
  MAIL_USERNAME,
  MONGO_PASSWORD,
  MONGO_URI,
  MONGO_USER,
  NODE_ENV,
  PORT,
  REDIS_DB,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  RESET_PASSWORD_TOKEN,
  REDIS_SENTINEL_NAME,
  REDIS_SENTINEL_PORT,
  SESSION_SECRET,
} = process.env

export default {
  MONGO_PASSWORD,
  MONGO_USER,
  MONGO_URI: ensureVariable('MONGO_URI', MONGO_URI),
  NODE_ENV: NODE_ENV ?? 'development',
  PORT: Number(PORT) || 5000,
  REDIS_HOST: ensureVariable('REDIS_HOST', REDIS_HOST),
  REDIS_DB: Number(ensureVariable('REDIS_DB', REDIS_DB)),
  REDIS_PASSWORD,
  REDIS_SENTINEL_PORT: Number(REDIS_SENTINEL_PORT) || 26379,
  REDIS_SENTINEL_NAME: REDIS_SENTINEL_NAME || 'hipocampo-primary',
  REDIS_PORT: Number(REDIS_PORT) || 6379,
  RESET_PASSWORD_TOKEN: ensureVariable(
    'RESET_PASSWORD_TOKEN',
    RESET_PASSWORD_TOKEN
  ),
  SESSION_SECRET: ensureVariable('SESSION_SECRET', SESSION_SECRET),
  MAIL_HOST,
  MAIL_USERNAME,
  MAIL_PASSWORD,
  DKIM_PRIVATE_KEY,
  DKIM_KEY_SELECTOR,
  DKIM_DOMAIN_NAME,
}
