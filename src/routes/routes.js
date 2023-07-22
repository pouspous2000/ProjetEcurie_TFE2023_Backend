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
import AdditiveRouter from '@/modules/additive/routes'
import HorseRouter from '@/modules/horse/routes'
import TaskRouter from '@/modules/task/routes'
import LessonRouter from '@/modules/lesson/routes'
import EventRouter from '@/modules/event/routes'
import CompetitionRouter from '@/modules/competition/routes'
import RideRouter from '@/modules/ride/routes'
import EventableRouter from '@/modules/eventable/routes'
import DailyRideRouter from '@/modules/daily-ride/routes'

import db from '@/database'
import { User } from '@/modules/authentication/model'
import { Contact } from '@/modules/contact/model'
import { Op } from 'sequelize'

const router = Router()

router.use(RgpdRouter)
router.use(AuthenticationRouter)
router.use(HorseContributorJobRouter)
router.use(StableRouter)
router.use(RoleRouter)
router.use(ContactRouter)
router.use(PensionRouter)
router.use(HorseContributorRouter)
router.use(AdditiveRouter)
router.use(HorseRouter)
router.use(TaskRouter)
router.use(LessonRouter)
router.use(EventRouter)
router.use(CompetitionRouter)
router.use(RideRouter)
router.use(EventableRouter)
router.use(DailyRideRouter)

// eslint-disable-next-line no-unused-vars
router.post(`/debug`, async function (request, response) {
	const result = await db.models.Event.findAll({
		include: [
			{
				model: User,
				as: 'creator',
				attributes: ['email'],
				include: {
					model: Contact,
					as: 'contact',
				},
			},
			{
				model: User,
				as: 'participants',
				attributes: ['email'],
				include: {
					model: Contact,
					as: 'contact',
				},
			},
		],
		where: {
			[Op.and]: [{ creatorId: 4 }, { '$participants.contact.userId$': { [Op.in]: [17] } }],
		},
	})

	return response.status(200).json(result)
})

router.use('/docs', swaggerUi.serve)
router.get('/docs', swaggerUi.setup(swaggerDocument))

export default router
