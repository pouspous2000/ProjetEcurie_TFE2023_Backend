import { Dotenv } from '@/utils/Dotenv'

new Dotenv()

const redisConfig = {
	port: process.env.REDIS_PORT,
	host: process.env.REDIS_HOST,
}

export default redisConfig
