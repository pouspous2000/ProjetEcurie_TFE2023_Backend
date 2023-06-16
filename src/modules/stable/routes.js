import { Router } from 'express'
import { StableController } from '@/modules/stable/controller'

const StableRouter = Router()
const prefix = 'stables'

StableRouter.get(`/${prefix}/:id`, StableController.show)

export default StableRouter
