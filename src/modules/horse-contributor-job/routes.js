import { Router } from 'express'
import validate from '@/middlewares/validate'
import isAuthenticated from '@/middlewares/is-authenticated'
import { HorseContributorJobController } from '@/modules/horse-contributor-job/controller'
import { HorseContributorJobValidator } from '@/modules/horse-contributor-job/validation'

const HorseContributorJobRouter = Router()
const controller = new HorseContributorJobController()

const prefix = 'horse_contributor_jobs'
HorseContributorJobRouter.get(`/${prefix}`, isAuthenticated, controller.index)
HorseContributorJobRouter.get(`/${prefix}/:id`, controller.show)
HorseContributorJobRouter.delete(`/${prefix}/:id`, controller.delete)
HorseContributorJobRouter.post(`/${prefix}`, validate(HorseContributorJobValidator.create()), controller.create)
HorseContributorJobRouter.put(`/${prefix}/:id`, validate(HorseContributorJobValidator.update()), controller.update)

export default HorseContributorJobRouter
