import { PDFDocument } from 'pdf-lib'
import { PassThrough } from 'stream'
import createError from 'http-errors'
import { BaseController } from '@/core/BaseController'
import { InvoiceService } from '@/modules/invoice/service'
import s3Client from '@/aws'
import i18next from '../../../i18n'

export class InvoiceController extends BaseController {
	constructor() {
		super(new InvoiceService())
		this._findOrFail = this._findOrFail.bind(this)
		this.upload = this.upload.bind(this)
		this.download = this.download.bind(this)
	}

	async upload(request, response, next) {
		try {
			return response.status(200).json({ file: request.file })
		} catch (error) {
			return next(error)
		}
	}

	async download(request, response, next) {
		try {
			// we do not validate anything for now as it is a test ...
			const awsObject = await this._findOrFail(request.params.id)
			response.setHeader('Content-Type', 'application/pdf')
			response.setHeader('Content-Disposition', `attachment; filename=${request.params.id}.pdf`)
			response.send(awsObject.Body)
		} catch (error) {
			if (error.statusCode === 404 && error.code === 'NoSuchKey') {
				throw createError(404, i18next.t('invoice_404'))
			}
			return next(error)
		}
	}

	async generateInvoice(request, response, next) {
		const doc = await PDFDocument.create()
		const page = doc.addPage([400, 200])
		const text = 'This is important.Sure.'
		page.drawText(text, { x: 50, y: 150 })

		const pdfStream = new PassThrough()
		const pdfBytes = await doc.save()
		await pdfStream.end(pdfBytes)

		try {
			await s3Client
				.upload({
					Bucket: process.env.FILE_BUCKET,
					Key: 'uniquekeybis',
					Body: pdfStream,
				})
				.promise()
			return response.status(200).json({ message: 'OK' })
		} catch (error) {
			return next
		}
	}

	async _findOrFail(objectId) {
		try {
			return await s3Client
				.getObject({
					Bucket: process.env.FILE_BUCKET,
					Key: objectId,
				})
				.promise()
		} catch (error) {
			if (error.statusCode === 404 && error.code === 'NoSuchKey') {
				throw createError(404, i18next.t('invoice_404'))
			}
			throw error
		}
	}
}
