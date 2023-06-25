import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../../swagger.json'

import RgpdRouter from '@/modules/rgpd/routes'
import HorseContributorJobRouter from '@/modules/horse-contributor-job/routes'
import StableRouter from '@/modules/stable/routes'
import RoleRouter from '@/modules/role/routes'
import ContactRouter from '@/modules/contact/routes'
import AuthenticationRouter from '@/modules/authentication/routes'

const router = Router()

router.use(RgpdRouter)
router.use(AuthenticationRouter)
router.use(HorseContributorJobRouter)
router.use(StableRouter)
router.use(RoleRouter)
router.use(ContactRouter)

// eslint-disable-next-line no-unused-vars
router.post(`/debug`, async function (request, response) {})

router.use('/docs', swaggerUi.serve)
router.get('/docs', swaggerUi.setup(swaggerDocument))

export default router
