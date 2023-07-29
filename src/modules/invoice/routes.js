import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import uploadFile from '@/middlewares/upload-file'
import { InvoiceController } from '@/modules/invoice/controller'

const invoiceRouter = Router()
const controller = new InvoiceController()
const prefix = 'invoices'

invoiceRouter.post(`/${prefix}`, isAuthenticated, uploadFile.single('document'), controller.upload)
invoiceRouter.get(`/${prefix}/:id`, isAuthenticated, controller.download)

export default invoiceRouter
