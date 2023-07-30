import { Cron } from '@/modules/cron/model'
import { BaseService } from '@/core/BaseService'
import { InvoiceService } from '@/modules/invoice/service'
import db from '@/database'

export class CronService extends BaseService {
	constructor() {
		super(Cron.getModelName(), 'cron_404')
		this._invoiceService = new InvoiceService()
	}

	async create(invoice, bucket = process.env.FILE_BUCKET) {
		const transaction = await db.transaction()
		try {
			const cron = await super.create({
				invoiceId: invoice.id,
				name: `invoice${invoice.id}`,
				step: 'PRE_PDF',
				status: 'FAILED',
			})
			await this._invoiceService.update(invoice, {
				bucket: bucket,
				key: `invoice${invoice.id}`,
			})
			await transaction.commit()
			return cron
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}

	async markAsPdfGenerated(cron) {
		return await super.update(cron, {
			step: 'PDF',
		})
	}

	async markAsDone(cron) {
		return await super.update(cron, {
			step: 'PDF_SENT',
			status: 'DONE',
		})
	}
}
