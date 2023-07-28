import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { LessonValidator } from '@/modules/lesson/validation'
import { LessonController } from '@/modules/lesson/controller'

const lessonRouter = Router()
const controller = new LessonController()
const prefix = 'lessons'

lessonRouter.get(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(LessonValidator.index()),
	controller.index
)
lessonRouter.get(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(LessonValidator.show()),
	controller.show
)
lessonRouter.delete(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(LessonValidator.delete()),
	controller.delete
)
lessonRouter.post(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(LessonValidator.create()),
	controller.create
)

lessonRouter.put(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(LessonValidator.update()),
	controller.update
)

export default lessonRouter
