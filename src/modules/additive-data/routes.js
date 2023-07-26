import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { AdditiveDataController } from '@/modules/additive-data/controller'
import { AdditiveDataValidator } from '@/modules/additive-data/validation'

const additiveDataRouter = Router()
const controller = new AdditiveDataController()
const prefix = `/horses/:horseId`

additiveDataRouter.post(
	`${prefix}/add`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(AdditiveDataValidator.add()),
	controller.add
)

additiveDataRouter.post(
	`${prefix}/cancel`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(AdditiveDataValidator.cancel()),
	controller.cancel
)

export default additiveDataRouter
