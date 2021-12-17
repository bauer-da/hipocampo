import type { Redis } from 'ioredis'
import redis from 'ioredis'

import config from './config'

let redisClient: Redis | null = null

export async function getRedisInstance(): Promise<Redis> {
  if (redisClient !== null) {
    return redisClient
  }

  redisClient = new redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    db: config.REDIS_DB,
    password: config.REDIS_PASSWORD,
  })

  redisClient.on('error', (error) => {
    console.error('[REDIS ERROR]', error)
  })

  return redisClient
}
