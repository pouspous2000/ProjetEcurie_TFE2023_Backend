import { Router } from 'express'
import validate from '@/middlewares/validate'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import { HorseContributorJobController } from '@/modules/horse-contributor-job/controller'
import { HorseContributorJobValidator } from '@/modules/horse-contributor-job/validation'

const HorseContributorJobRouter = Router()
const controller = new HorseContributorJobController()

const prefix = 'horse_contributor_jobs'
HorseContributorJobRouter.get(`/${prefix}`, isAuthenticated, controller.index)
HorseContributorJobRouter.get(
	`/${prefix}/:id`,
	isAuthenticated,
	validate(HorseContributorJobValidator.show()),
	controller.show
)
HorseContributorJobRouter.delete(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(HorseContributorJobValidator.delete()),
	controller.delete
)
HorseContributorJobRouter.post(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(HorseContributorJobValidator.create()),
	controller.create
)
HorseContributorJobRouter.put(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(HorseContributorJobValidator.update()),
	controller.update
)

export default HorseContributorJobRouter
