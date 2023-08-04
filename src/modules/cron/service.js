import { Cron } from '@/modules/cron/model'
import { BaseService } from '@/core/BaseService'

export class CronService extends BaseService {
	constructor() {
		super(Cron.getModelName(), 'cron_404')
	}

	async create(invoice) {
		return await super.create({
			invoiceId: invoice.id,
			name: `invoice${invoice.id}`,
			step: 'PRE_PDF',
			status: 'FAILED',
		})
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
