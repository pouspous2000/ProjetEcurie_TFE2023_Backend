import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../../swagger.json'

import RgpdRouter from '@/modules/rgpd/routes'
import HorseContributorJobRouter from '@/modules/horse-contributor-job/routes'
import StableRouter from '@/modules/stable/routes'
import RoleRouter from '@/modules/role/routes'
import AuthenticationRouter from '@/modules/authentication/routes'

import { RoleService } from '@/modules/role/service'

const router = Router()

router.use(RgpdRouter)
router.use(AuthenticationRouter)
router.use(HorseContributorJobRouter)
router.use(StableRouter)
router.use(RoleRouter)

router.post(`/debug`, async function (request, response) {
	const service = new RoleService()
	const data = request.body // je peux appeler le service
	const role = await service.findOrFail(data.id)
	const ids = await service.getSubRoleIds(role)

	return response.status(200).json({
		data: ids,
	})
})

router.use('/docs', swaggerUi.serve)
router.get('/docs', swaggerUi.setup(swaggerDocument))

export default router
