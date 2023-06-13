import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../../swagger.json'
import HorseContributorJobRouter from '@/modules/horse-contributor-job/routes'

const router = Router()
router.use(HorseContributorJobRouter)

router.use('/docs', swaggerUi.serve)
router.get('/docs', swaggerUi.setup(swaggerDocument))

export default router
