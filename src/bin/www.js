import http from 'http'
import debugLib from 'debug'
import app from '@/app'
import db from '@/database'
import redisClient from '@/cache'
import { EmailUtils } from '@/utils/EmailUtils'

import { Dotenv } from '@/utils/Dotenv'
import { errorHandlerLogger, otherLogger } from '@/loggers/loggers'

new Dotenv()

const debug = debugLib('express-starter:server')

const port = process.env.SERVER_PORT
app.set('port', port)

const server = http.createServer(app)

// check db connexion and serve only if connexion is successful
db.authenticate()
	.then(() => {
		server.listen(port)
		server.on('error', onError)
		server.on('listening', onListening)
	})
	.catch(err => {
		console.error('Database connection error', err)
	})

// check cache connexion and log if connexion is down
redisClient
	.connect()
	.then(() => {
		console.log('redis connection : ok')
		otherLogger.log('info', 'redis is connected')
	})
	.then(() => {
		redisClient
			.flushAll()
			.then(() => {
				console.log('redis flushed')
			})
			.catch(() => {
				console.log('error while redis  flush')
			})
	})
	.catch(error => {
		console.error(`Redis connection or flush error ${error}`) // [IMP] refactore with async await the entire file
		errorHandlerLogger.log('error', `Redis connection error ${error}`)
	})

// check smtp connexion and log if connexion is down
EmailUtils.getTransporter()
	.then(transporter => {
		transporter.verify()
	})
	.then(() => {
		console.log('smtp: connected')
		otherLogger.log('info', 'smtp is connected')
	})
	.catch(error => {
		console.error(`SMTP connection error ${error}`)
		errorHandlerLogger.log('error', `SMTP connection error ${error}`)
	})

//Event listener for HTTP server "error" event.
function onError(error) {
	if (error.syscall !== 'listen') {
		throw error
	}

	const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(`${bind} requires elevated privileges`)
			errorHandlerLogger.log('error', `${bind} requires elevated privileges`)
			process.exit(1)
			break
		case 'EADDRINUSE':
			console.error(`${bind} is already in use`)
			errorHandlerLogger.log('error', `${bind} is already in use`)
			process.exit(1)
			break
		default:
			throw error
	}
}

// Event listener for HTTP server "listening" event.
function onListening() {
	const addr = server.address()
	const bind = typeof addr === 'string' ? `Pipe ${addr}` : `Port ${addr.port}`
	debug(`Listening on ${bind}`)
	console.log(`Listening on ${bind}`)
	otherLogger.log('info', `Listening on ${bind}`)
}
