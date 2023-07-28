import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { DailyRideValidator } from '@/modules/daily-ride/validation'
import { DailyRideController } from '@/modules/daily-ride/controller'

const dailyRideRouter = Router()
const controller = new DailyRideController()
const prefix = 'daily-rides'

dailyRideRouter.get(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(DailyRideValidator.index()),
	controller.index
)
dailyRideRouter.get(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(DailyRideValidator.show()),
	controller.show
)
dailyRideRouter.delete(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(DailyRideValidator.delete()),
	controller.delete
)

dailyRideRouter.post(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(DailyRideValidator.create()),
	controller.create
)

dailyRideRouter.put(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(DailyRideValidator.update()),
	controller.update
)

export default dailyRideRouter
