import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { InvoiceController } from '@/modules/invoice/controller'
import { InvoiceValidator } from '@/modules/invoice/validation'

const invoiceRouter = Router()
const controller = new InvoiceController()
const prefix = 'invoices'

invoiceRouter.get(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(InvoiceValidator.index()),
	controller.index
)

invoiceRouter.get(
	`/${prefix}/download/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(InvoiceValidator.download()),
	controller.download
)

invoiceRouter.get(
	`/${prefix}/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN', 'EMPLOYEE', 'CLIENT']),
	validate(InvoiceValidator.show()),
	controller.show
)

// invoiceRouter.post(`/${prefix}`, isAuthenticated, uploadFile.single('document'), controller.upload)
// invoiceRouter.post(`/${prefix}/generatepdf`, isAuthenticated, controller.generateInvoice)

export default invoiceRouter
