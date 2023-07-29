import { BaseController } from '@/core/BaseController'
import { InvoiceService } from '@/modules/invoice/service'
import { AwsService } from '@/utils/AwsUtils'

export class InvoiceController extends BaseController {
	constructor() {
		super(new InvoiceService())
		this._awsService = new AwsService()
		this.upload = this.upload.bind(this)
		this.download = this.download.bind(this)
		this.generateInvoice = this.generateInvoice.bind(this)
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
			const key = request.params.id
			const awsObject = await this._awsService.findByKey(key)
			response.setHeader('Content-Type', 'application/pdf')
			response.setHeader('Content-Disposition', `attachment; filename=${key}.pdf`)
			response.send(awsObject.Body)
		} catch (error) {
			return next(error)
		}
	}

	async generateInvoice(request, response, next) {
		// this method is about to be deleted
		try {
			await this._service.generateInvoice('someuniquekey')
			return response.status(200).json({ message: 'OK' })
		} catch (error) {
			return next(error)
		}
	}
}
