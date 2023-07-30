import { BaseFactory } from '@/core/BaseFactory'
import { ArrayUtils } from '@/utils/ArrayUtils'

export class CronFactory extends BaseFactory {
	static create(invoiceId, step = undefined) {
		step = step ? step : ArrayUtils.getRandomElement(['PRE_PDF', 'PDF', 'PDF_SENT'])
		return {
			invoiceId,
			name: `invoice${invoiceId}`,
			step,
			status: step === 'PDF_SENT' ? 'DONE' : 'FAILED',
			...this._create(),
		}
	}

	static createFailedBeforePDF(invoiceId) {
		return this.create(invoiceId, 'PRE_PDF')
	}

	static createFailedAfterPDFAndBeforeEmail(invoiceId) {
		return this.create(invoiceId, 'PDF')
	}

	static createSuccess(invoiceId) {
		return this.create(invoiceId, 'PDF_SENT')
	}
}
