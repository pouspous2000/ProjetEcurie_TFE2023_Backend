import { Router } from 'express'
import { HorseContributorJobController } from '@/modules/horse-contributor-job/controller'

const HorseContributorJobRouter = Router()

const prefix = 'horse_contributor_jobs'
HorseContributorJobRouter.get(`/${prefix}`, HorseContributorJobController.index)
HorseContributorJobRouter.get(`/${prefix}/:id`, HorseContributorJobController.show)

export default HorseContributorJobRouter
