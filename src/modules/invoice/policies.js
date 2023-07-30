import createError from 'http-errors'
import i18next from '../../../i18n'

export class InvoicePolicy {
	async index(request, invoices) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return invoices
			case 'EMPLOYEE':
				return invoices
			case 'CLIENT':
				return invoices.filter(invoice => invoice.clientId === request.user.id)
		}
	}

	async show(request, invoice) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return invoice
			case 'EMPLOYEE':
				return invoice
			case 'CLIENT':
				if (request.user.id !== invoice.clientId) {
					throw createError(401, i18next.t('invoice_401'))
				}
				return invoice
		}
	}

	async download(request, invoice) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return invoice
			case 'EMPLOYEE':
				return invoice
			case 'CLIENT':
				if (request.user.id !== invoice.clientId) {
					throw createError(401, i18next.t('invoice_401'))
				}
				return invoice
		}
	}
}
