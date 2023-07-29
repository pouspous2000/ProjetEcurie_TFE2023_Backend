import { PDFDocument } from 'pdf-lib'
import { PassThrough } from 'stream'

import { AwsService } from '@/utils/AwsUtils'

export class InvoiceService {
	// This will extend soon baseService to manage actual invoices
	constructor() {
		this._awsService = new AwsService()
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
