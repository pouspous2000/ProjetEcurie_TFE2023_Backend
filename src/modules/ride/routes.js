import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { RideValidator } from '@/modules/ride/validation'
import { RideController } from '@/modules/ride/controller'

const rideRouter = Router()
const controller = new RideController()

const prefix = 'rides'
rideRouter.get(`/${prefix}`, isAuthenticated, controller.index)
rideRouter.get(`/${prefix}/:id`, isAuthenticated, validate(RideValidator.show()), controller.show)
rideRouter.delete(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN']),
	validate(RideValidator.delete()),
	controller.delete
)
rideRouter.post(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN']),
	validate(RideValidator.create()),
	controller.create
)

rideRouter.put(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN']),
	validate(RideValidator.update()),
	controller.update
)

export default rideRouter
