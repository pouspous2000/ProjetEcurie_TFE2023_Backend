import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { StableController } from '@/modules/stable/controller'
import { StableValidator } from '@/modules/stable/validation'

const StableRouter = Router()
const controller = new StableController()
const prefix = 'stables'

StableRouter.get(`/${prefix}/:id`, isAuthenticated, controller.show)
StableRouter.put(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN']),
	validate(StableValidator.update()),
	controller.update
)

export default StableRouter
