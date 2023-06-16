import { Router } from 'express'
import validate from '@/middlewares/validate'
import { StableController } from '@/modules/stable/controller'
import { StableValidator } from '@/modules/stable/validation'

const StableRouter = Router()
const prefix = 'stables'

StableRouter.get(`/${prefix}/:id`, StableController.show)
StableRouter.put(`/${prefix}/:id`, validate(StableValidator.update()), StableController.update)

export default StableRouter
