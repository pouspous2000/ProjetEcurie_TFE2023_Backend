import { Router } from 'express'
import validate from '@/middlewares/validate'
import { RoleController } from '@/modules/role/controller'
import { RoleValidator } from '@/modules/role/validation'

const RoleRouter = Router()

const prefix = 'roles'
RoleRouter.get(`/${prefix}`, RoleController.index)
RoleRouter.get(`/${prefix}/:id`, RoleController.show)
RoleRouter.delete(`/${prefix}/:id`, RoleController.delete)
RoleRouter.post(`/${prefix}`, validate(RoleValidator.create()), RoleController.create)
RoleRouter.put(`/${prefix}/:id`, validate(RoleValidator.update()), RoleController.update)

export default RoleRouter
