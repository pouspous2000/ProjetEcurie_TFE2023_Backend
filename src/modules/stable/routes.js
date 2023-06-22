import { Router } from 'express'
import validate from '@/middlewares/validate'
import { StableController } from '@/modules/stable/controller'
import { StableValidator } from '@/modules/stable/validation'

const StableRouter = Router()
const controller = new StableController()
const prefix = 'stables'

StableRouter.get(`/${prefix}/:id`, controller.show)
StableRouter.put(`/${prefix}/:id`, validate(StableValidator.update()), controller.update)

export default StableRouter
