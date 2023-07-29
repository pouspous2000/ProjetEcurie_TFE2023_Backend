import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../../swagger.json'

import rgpdRouter from '@/modules/rgpd/routes'
import horseContributorJobRouter from '@/modules/horse-contributor-job/routes'
import stableRouter from '@/modules/stable/routes'
import roleRouter from '@/modules/role/routes'
import contactRouter from '@/modules/contact/routes'
import authenticationRouter from '@/modules/authentication/routes'
import pensionRouter from '@/modules/pension/routes'
import horseContributorRouter from '@/modules/horse-contributor/routes'
import additiveRouter from '@/modules/additive/routes'
import horseRouter from '@/modules/horse/routes'
import taskRouter from '@/modules/task/routes'
import lessonRouter from '@/modules/lesson/routes'
import eventRouter from '@/modules/event/routes'
import competitionRouter from '@/modules/competition/routes'
import rideRouter from '@/modules/ride/routes'
import eventableRouter from '@/modules/eventable/routes'
import dailyRideRouter from '@/modules/daily-ride/routes'
import additiveDataRouter from '@/modules/additive-data/routes'
import horseContributorHorseContributorJobRouter from '@/modules/horseContributor-horseContributorJob/routes'
import invoiceRouter from '@/modules/invoice/routes'

const router = Router()

router.use(rgpdRouter)
router.use(authenticationRouter)
router.use(horseContributorJobRouter)
router.use(stableRouter)
router.use(roleRouter)
router.use(contactRouter)
router.use(pensionRouter)
router.use(horseContributorRouter)
router.use(additiveRouter)
router.use(horseRouter)
router.use(taskRouter)
router.use(lessonRouter)
router.use(eventRouter)
router.use(competitionRouter)
router.use(rideRouter)
router.use(eventableRouter)
router.use(dailyRideRouter)
router.use(additiveDataRouter)
router.use(horseContributorHorseContributorJobRouter)
router.use(invoiceRouter)

router.use('/docs', swaggerUi.serve)
router.get('/docs', swaggerUi.setup(swaggerDocument))

export default router
