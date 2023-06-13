import { Router } from 'express'

const router = Router()

router.get('/', (request, response) => {
	return response.send('hello world')
})

export default router
