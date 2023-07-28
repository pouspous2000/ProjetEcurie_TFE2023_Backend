import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { EventController } from '@/modules/event/controller'
import { EventValidator } from '@/modules/event/validation'

const eventRouter = Router()
const controller = new EventController()
const prefix = 'events'

eventRouter.get(`/${prefix}`, isAuthenticated, validate(EventValidator.index()), controller.index)
eventRouter.get(`/${prefix}/:id`, isAuthenticated, validate(EventValidator.show()), controller.show)
eventRouter.delete(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(EventValidator.delete()),
	controller.delete
)
eventRouter.post(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(EventValidator.create()),
	controller.create
)

eventRouter.put(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(EventValidator.update()),
	controller.update
)

eventRouter.post(`/${prefix}/:id`, isAuthenticated, controller.subscribe)

export default eventRouter
