import { createClient } from 'redis'
import redisConfig from '@/configuration/redis'

const redisClient = createClient(redisConfig)

export default redisClient
