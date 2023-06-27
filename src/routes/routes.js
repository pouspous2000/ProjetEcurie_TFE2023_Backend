import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../../swagger.json'

import RgpdRouter from '@/modules/rgpd/routes'
import HorseContributorJobRouter from '@/modules/horse-contributor-job/routes'
import StableRouter from '@/modules/stable/routes'
import RoleRouter from '@/modules/role/routes'
import ContactRouter from '@/modules/contact/routes'
import AuthenticationRouter from '@/modules/authentication/routes'
import PensionRouter from '@/modules/pension/routes'
import HorseContributorRouter from '@/modules/horse-contributor/routes'

import { PensionFactory } from '@/modules/pension/factory'

const router = Router()

router.use(RgpdRouter)
router.use(AuthenticationRouter)
router.use(HorseContributorJobRouter)
router.use(StableRouter)
router.use(RoleRouter)
router.use(ContactRouter)
router.use(PensionRouter)
router.use(HorseContributorRouter)

// eslint-disable-next-line no-unused-vars
router.post(`/debug`, async function (request, response) {
	const machin = PensionFactory.create()
	const bidule = PensionFactory.bulkCreate(10)
	console.log(bidule.length)
	console.log(machin)
	return response.status(200).json({
		data: PensionFactory.create(),
	})
})

router.use('/docs', swaggerUi.serve)
router.get('/docs', swaggerUi.setup(swaggerDocument))

export default router
