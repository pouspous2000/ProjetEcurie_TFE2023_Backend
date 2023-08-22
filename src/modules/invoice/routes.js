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

invoiceRouter.post(
	`/${prefix}`,
	isAuthenticated,
	hasRoleCategory(['ADMIN']),
	validate(InvoiceValidator.create()),
	controller.manualCreateInvoiceForUserId
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

invoiceRouter.post(
	`/${prefix}/markAsPaid/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN']),
	validate(InvoiceValidator.markAsPaid()),
	controller.markAsPaid
)

invoiceRouter.post(
	`/${prefix}/markAsUnpaid/:id`,
	isAuthenticated,
	hasRoleCategory(['ADMIN']),
	validate(InvoiceValidator.show()),
	controller.markAsUnpaid
)

export default invoiceRouter
