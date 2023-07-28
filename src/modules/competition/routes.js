import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { CompetitionController } from '@/modules/competition/controller'
import { CompetitionValidator } from '@/modules/competition/validation'

const competitionRouter = Router()
const controller = new CompetitionController()
const prefix = 'competitions'

competitionRouter.get(`/${prefix}`, isAuthenticated, validate(CompetitionValidator.index()), controller.index)
competitionRouter.get(`/${prefix}/:id`, isAuthenticated, validate(CompetitionValidator.show()), controller.show)
competitionRouter.delete(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(CompetitionValidator.delete()),
	controller.delete
)
competitionRouter.post(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(CompetitionValidator.create()),
	controller.create
)
competitionRouter.put(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE']),
	validate(CompetitionValidator.update()),
	controller.update
)

competitionRouter.post(
	`/${prefix}/:id`,
	isAuthenticated,
	validate(CompetitionValidator.confirm()),
	controller.subscribe
)

export default competitionRouter
