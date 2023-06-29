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

import db from '@/database'
import { User } from '@/modules/authentication/model'
import { Contact } from '@/modules/contact/model'
import { Pension } from '@/modules/pension/model'

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

// eslint-disable-next-line no-unused-vars
router.post(`/debug`, async function (request, response) {
	const res = await db.models.Horse.create(
		{
			ownerId: 1,
			pensionId: 1,
			name: 'patapouf',
			comment: 'some comment',
		},
		{
			include: [
				{
					model: User,
					as: 'owner',
					attributes: ['email'],
					include: {
						model: Contact,
						as: 'contact',
					},
				},
				{
					model: Pension,
					as: 'pension',
				},
			],
		}
	)
	return response.status(200).json(res) // ca ne fonctionne pas donc je pense que je dois faire une query en plus
})

router.use('/docs', swaggerUi.serve)
router.get('/docs', swaggerUi.setup(swaggerDocument))

export default router
