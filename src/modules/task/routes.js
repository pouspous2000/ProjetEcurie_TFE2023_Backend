import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { TaskController } from '@/modules/task/controller'
import { TaskValidator } from '@/modules/task/validation'

const taskRouter = Router()
const controller = new TaskController()
const prefix = 'tasks'

taskRouter.get(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(TaskValidator.index()),
	controller.index
)

taskRouter.get(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(TaskValidator.show()),
	controller.show
)
taskRouter.delete(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN']),
	validate(TaskValidator.delete()),
	controller.delete
)
taskRouter.post(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN']),
	validate(TaskValidator.create()),
	controller.create
)
taskRouter.put(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(TaskValidator.update()),
	controller.update
)

export default taskRouter
