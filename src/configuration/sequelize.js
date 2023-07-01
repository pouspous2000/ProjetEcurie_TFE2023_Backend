import { Dotenv } from '@/utils/Dotenv'

new Dotenv()

const defaultConfig = {
	dialect: 'postgres',
	database: process.env.DATABASE_NAME,
	host: process.env.DATABASE_HOST,
	port: process.env.DATABASE_PORT,
	username: process.env.DATABASE_USERNAME,
	password: process.env.DATABASE_PASSWORD,
}

export const DEV = {
	...defaultConfig,
	logQueryParameters: true,
}

export const TEST = {
	...defaultConfig,
	logging: false,
}

export const PROD = {
	...defaultConfig,
	logging: false,
}
