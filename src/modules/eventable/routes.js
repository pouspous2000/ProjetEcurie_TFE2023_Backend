import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import { EventableController } from '@/modules/eventable/controller'

const eventableRouter = Router()
const controller = new EventableController()
const prefix = 'eventables'

eventableRouter.get(`/${prefix}`, isAuthenticated, hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']), controller.index)

export default eventableRouter
