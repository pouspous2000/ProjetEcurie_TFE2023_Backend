import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { AdditiveValidator } from '@/modules/additive/validation'
import { AdditiveController } from '@/modules/additive/controller'

const additiveRouter = Router()
const controller = new AdditiveController()

const prefix = 'additives'
additiveRouter.get(`/${prefix}`, isAuthenticated, controller.index)
additiveRouter.get(`/${prefix}/:id`, isAuthenticated, controller.show)
additiveRouter.delete(`/${prefix}/:id`, isAuthenticated, hasRoleCategory(['ADMIN']), controller.delete)
additiveRouter.post(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN']),
	validate(AdditiveValidator.create()),
	controller.create
)
additiveRouter.put(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN']),
	validate(AdditiveValidator.update()),
	controller.update
)
export default additiveRouter
