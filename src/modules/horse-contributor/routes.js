import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { HorseContributorValidator } from '@/modules/horse-contributor/validation'
import { HorseContributorController } from '@/modules/horse-contributor/controller'

const horseContributorRouter = Router()
const controller = new HorseContributorController()

const prefix = 'horse_contributors'
horseContributorRouter.get(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	controller.index
)
horseContributorRouter.get(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	controller.show
)
horseContributorRouter.delete(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	controller.delete
)
horseContributorRouter.post(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(HorseContributorValidator.create()),
	controller.create
)
horseContributorRouter.put(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(HorseContributorValidator.update()),
	controller.update
)

export default horseContributorRouter
