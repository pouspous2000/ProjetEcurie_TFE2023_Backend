import { Dotenv } from '@/utils/Dotenv'

const environment = new Dotenv()

export default {
	origin: environment.environment === 'PROD' ? process.env.CORS_ALLOWED_ORIGIN : false,
	optionsSuccessStatus: 200,
	allowedHeaders: ['Content-Type', 'Authorization', 'RefreshToken'],
	exposedHeaders: ['Content-Length', 'Content-Type', 'RefreshToken', 'Token'],
}
