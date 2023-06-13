import express from 'express'
import createError from 'http-errors'
import router from '@/routes/routes'

const app = express()

//middlewares
app.use(express.json())

//routes
app.use(router)

app.use((req, res, next) => {
	next(createError(404, 'Resource not found'))
})

// eslint-disable-next-line no-unused-vars
app.use((error, request, response, _next) => {
	response.status(error.status || 500).json(error)
})

export default app
