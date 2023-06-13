import { Router } from 'express'
import i18next from '../../i18n'

const router = Router()

router.get('/', (request, response) => {
	return response.send(i18next.t('hello_world'))
})

export default router
