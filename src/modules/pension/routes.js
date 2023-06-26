import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { PensionController } from '@/modules/pension/controller'
import { PensionValidator } from '@/modules/pension/validation'

const controller = new PensionController()
const pensionRouter = Router()
const prefix = 'pensions'

pensionRouter.get(`/${prefix}`, isAuthenticated, controller.index)
pensionRouter.get(`/${prefix}/:id`, isAuthenticated, controller.show)
pensionRouter.delete(`/${prefix}/:id`, isAuthenticated, hasRoleCategory(['ADMIN']), controller.delete)
pensionRouter.post(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN']),
	validate(PensionValidator.create()),
	controller.create
)

pensionRouter.put(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN']),
	validate(PensionValidator.update()),
	controller.update
)

export default pensionRouter
