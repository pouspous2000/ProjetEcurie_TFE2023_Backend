import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { HorseContributorHorseContributorJobController } from '@/modules/horseContributor-horseContributorJob/controller'
import { HorseContributorHorseContributorJobValidator } from '@/modules/horseContributor-horseContributorJob/validation'

const horseContributorHorseContributorJobRouter = Router()
const controller = new HorseContributorHorseContributorJobController()
const prefix = `/horses/:horseId`

horseContributorHorseContributorJobRouter.post(
	`${prefix}/addJobs`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(HorseContributorHorseContributorJobValidator.addJobs()),
	controller.addJobs
)

horseContributorHorseContributorJobRouter.post(
	`${prefix}/removeJobs`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(HorseContributorHorseContributorJobValidator.removeJobs()),
	controller.removeJobs
)

export default horseContributorHorseContributorJobRouter
