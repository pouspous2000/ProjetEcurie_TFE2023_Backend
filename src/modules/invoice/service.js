import { PDFDocument } from 'pdf-lib'
import { PassThrough } from 'stream'
import createError from 'http-errors'

import { Invoice } from '@/modules/invoice/model'
import { AwsService } from '@/utils/AwsUtils'
import { BaseService } from '@/core/BaseService'
import i18next from '../../../i18n'

export class InvoiceService extends BaseService {
	constructor() {
		super(Invoice.getModelName(), 'invoice_404')
		this._awsService = new AwsService()
	}

	async markAsPaid(invoice, paidAt = undefined) {
		if (!paidAt) {
			paidAt = new Date()
		}
		if (paidAt < invoice.createdAt) {
			throw createError(422, i18next.t('invoice_422_markAsPaid_inconsistentDate'))
		}
		if (invoice.status === 'PAID') {
			throw createError(422, i18next.t('invoice_422_markAsPaid_alreadyPaid'))
		}

		return await super.update(invoice, {
			status: 'PAID',
			paidAt: paidAt,
		})
	}

	async markAsUnpaid(invoice) {
		if (invoice.status === 'UNPAID') {
			throw createError(422, i18next.t('invoice_422_markAsUnpaid_alreadyUnpaid'))
		}

		return await super.update(invoice, {
			status: 'UNPAID',
			paidAt: null,
		})
	}

	async generateInvoice(key) {
		// the content is static for now
		const doc = await PDFDocument.create()
		const page = doc.addPage([400, 200])
		const text = 'This is important.Sure.'
		page.drawText(text, { x: 50, y: 150 })

		const pdfStream = new PassThrough()
		const pdfBytes = await doc.save()
		await pdfStream.end(pdfBytes)

		await this._awsService.upload(key, pdfStream)
	}
}
