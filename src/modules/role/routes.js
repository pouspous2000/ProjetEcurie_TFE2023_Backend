import { Router } from 'express'
import validate from '@/middlewares/validate'
import { RoleController } from '@/modules/role/controller'
import { RoleValidator } from '@/modules/role/validation'

const RoleRouter = Router()
const controller = new RoleController()

const prefix = 'roles'
RoleRouter.get(`/${prefix}`, controller.index)
RoleRouter.get(`/${prefix}/:id`, controller.show)
RoleRouter.delete(`/${prefix}/:id`, controller.delete)
RoleRouter.post(`/${prefix}`, validate(RoleValidator.create()), controller.create)
RoleRouter.put(`/${prefix}/:id`, validate(RoleValidator.update()), controller.update)

export default RoleRouter
