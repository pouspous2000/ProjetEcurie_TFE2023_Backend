import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { HorseController } from '@/modules/horse/controller'
import { HorseValidator } from '@/modules/horse/validation'

const horseRouter = Router()
const controller = new HorseController()
const prefix = 'horses'

horseRouter.get(`/${prefix}`, isAuthenticated, hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']), controller.index)
horseRouter.get(`/${prefix}/:id`, isAuthenticated, hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']), controller.show)
horseRouter.delete(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	controller.delete
)
horseRouter.post(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(HorseValidator.create()),
	controller.create
)
horseRouter.put(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(HorseValidator.update()),
	controller.update
)

export default horseRouter
