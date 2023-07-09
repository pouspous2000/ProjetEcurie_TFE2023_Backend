import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import validate from '@/middlewares/validate'
import { EventController } from '@/modules/event/controller'
import { EventValidator } from '@/modules/event/validation'

const eventRouter = Router()
const controller = new EventController()
const prefix = 'events'

eventRouter.get(`/${prefix}`, isAuthenticated, validate(EventValidator.index()), controller.index)
eventRouter.get(`/${prefix}/:id`, isAuthenticated, controller.show)

export default eventRouter
