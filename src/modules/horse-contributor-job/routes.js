import { Router } from 'express'
import cache from '@/middlewares/cache'
import validate from '@/middlewares/validate'
import { HorseContributorJobController } from '@/modules/horse-contributor-job/controller'
import { HorseContributorJobValidator } from '@/modules/horse-contributor-job/validation'

const HorseContributorJobRouter = Router()

const prefix = 'horse_contributor_jobs'
HorseContributorJobRouter.get(`/${prefix}`, cache('HorseContributorJob'), HorseContributorJobController.index)
HorseContributorJobRouter.get(`/${prefix}/:id`, cache('HorseContributorJob'), HorseContributorJobController.show)
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
