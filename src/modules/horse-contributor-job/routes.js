import { Router } from 'express'
import validate from '@/middlewares/validate'
import isAuthenticated from '@/middlewares/is-authenticated'
import { HorseContributorJobController } from '@/modules/horse-contributor-job/controller'
import { HorseContributorJobValidator } from '@/modules/horse-contributor-job/validation'

const HorseContributorJobRouter = Router()

const prefix = 'horse_contributor_jobs'
HorseContributorJobRouter.get(`/${prefix}`, isAuthenticated, HorseContributorJobController.index)
HorseContributorJobRouter.get(`/${prefix}/:id`, HorseContributorJobController.show)
HorseContributorJobRouter.delete(`/${prefix}/:id`, HorseContributorJobController.delete)
HorseContributorJobRouter.post(
	`/${prefix}`,
	validate(HorseContributorJobValidator.create()),
	HorseContributorJobController.create
)
HorseContributorJobRouter.put(
	`/${prefix}/:id`,
	validate(HorseContributorJobValidator.update()),
	HorseContributorJobController.update
)

export default HorseContributorJobRouter
