import { Router } from 'express'
import { RoleController } from '@/modules/role/controller'

const RoleRouter = Router()

const prefix = 'roles'
RoleRouter.get(`/${prefix}`, RoleController.index)
RoleRouter.get(`/${prefix}/:id`, RoleController.show)

export default RoleRouter
