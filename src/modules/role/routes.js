import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { RoleController } from '@/modules/role/controller'
import { RoleValidator } from '@/modules/role/validation'

const RoleRouter = Router()
const controller = new RoleController()

const prefix = 'roles'
RoleRouter.get(`/${prefix}`, isAuthenticated, controller.index)
RoleRouter.get(`/${prefix}/:id`, isAuthenticated, controller.show)
RoleRouter.delete(`/${prefix}/:id`, isAuthenticated, hasRoleCategory(['ADMIN']), controller.delete)
RoleRouter.post(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(RoleValidator.create()),
	controller.create
)
RoleRouter.put(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(RoleValidator.update()),
	controller.update
)

export default RoleRouter
