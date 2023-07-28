import express from 'express'
import createError from 'http-errors'
import helmet from 'helmet'
import cors from 'cors'
import router from '@/routes/routes'
import i18next from '../i18n'
import expressWinston from 'express-winston'
import { requestLogger } from '@/loggers/loggers'
import { errorHandlerLogger } from '@/loggers/loggers'

import { Dotenv } from '@/utils/Dotenv'
import { generalExceptLoginRateLimiter } from '@/middlewares/rate-limiter'
import corsConfig from '@/configuration/cors'
import { sequelizeErrorFormatter } from '@/middlewares/sql-error'
import authenticate from '@/middlewares/authentication'

const environment = new Dotenv()
const app = express()

//middlewares
app.disable('x-powered-by')
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(helmet())
app.use(cors(corsConfig))
if (environment.environment === 'PROD') {
	app.use(generalExceptLoginRateLimiter)
}
app.use(
	expressWinston.logger({
		winstonInstance: requestLogger,
		statusLevels: true,
	})
)
app.use(authenticate)

//routes
app.use(router)

// 404 handler
app.use((req, res, next) => {
	next(createError(404, i18next.t('common_404')))
})

// middleware to log unhandled errors, position is not a choice
app.use(
	expressWinston.errorLogger({
		winstonInstance: errorHandlerLogger,
		statusLevels: true,
	})
)

app.use(sequelizeErrorFormatter)

// eslint-disable-next-line no-unused-vars
app.use((error, request, response, _next) => {
	const errorMessage = environment.environment === 'PROD' ? i18next.t('common_error') : error
	return response.status(error.status || 500).json(errorMessage)
})

export default app
