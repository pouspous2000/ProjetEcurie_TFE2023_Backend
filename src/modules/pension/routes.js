import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import { PensionController } from '@/modules/pension/controller'

const controller = new PensionController()
const pensionRouter = Router()
const prefix = 'pensions'

pensionRouter.get(`/${prefix}`, isAuthenticated, controller.index)
pensionRouter.get(`/${prefix}/:id`, isAuthenticated, controller.show)
pensionRouter.delete(`/${prefix}/:id`, isAuthenticated, hasRoleCategory(['ADMIN']), controller.delete)

export default pensionRouter
