import { Dotenv } from '@/utils/Dotenv'

new Dotenv()

const defaultConfig = {
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	auth: {
		user: process.env.SMTP_USERNAME,
		pass: process.env.SMTP_PASSWORD,
	},
	logger: false,
	pool: true,
}

export const DEV = {
	...defaultConfig,
	debug: true,
	secure: false,
}

export const TEST = {
	...defaultConfig,
	debug: false,
	secure: false,
}

export const PROD = {
	...defaultConfig,
	debug: false,
	secure: Number(process.env.SMTP_PORT) === 465,
}
