import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import { RideController } from '@/modules/ride/controller'

const rideRouter = Router()
const controller = new RideController()

const prefix = 'rides'
rideRouter.get(`/${prefix}`, isAuthenticated, controller.index)
rideRouter.get(`/${prefix}/:id`, isAuthenticated, controller.show)
rideRouter.delete(`/${prefix}/:id`, isAuthenticated, hasRoleCategory(['ADMIN']), controller.delete)

export default rideRouter
