import { Router } from 'express'
import { RgpdController } from '@/modules/rgpd/controller'

const rgpdRouter = Router()
const controller = new RgpdController()

rgpdRouter.get('/rgpd', controller.getRgpd)

export default rgpdRouter
