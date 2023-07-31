import { query, body } from 'express-validator'
import { BaseValidator } from '@/core/BaseValidator'
import { DateUtils } from '@/utils/DateUtils'
import i18next from '../../../i18n'

export class InvoiceValidator extends BaseValidator {
	static index() {
		return [
			query('status')
				.optional()
				.isIn(['UNPAID', 'PAID'])
				.withMessage(i18next.t('invoice_request_validation_query_status_isIn')),
			query('clientId')
				.optional()
				.isInt({ min: 1 })
				.withMessage(i18next.t('invoice_request_validation_query_clientId_isInt')),
			query('cronStatus')
				.optional()
				.isIn(['DONE', 'FAILED'])
				.withMessage(i18next.t('invoice_request_validation_query_cronStatus_isIn')),
			query('year')
				.optional()
				.isInt({ min: 1 })
				.withMessage(i18next.t('invoice_request_validation_query_year_isInt')),
			query('month')
				.optional()
				.isInt({ min: 0, max: 11 })
				.withMessage(i18next.t('invoice_request_validation_query_month_isInt')),
		]
	}

	static download() {
		return super.show()
	}

	static markAsPaid() {
		return [
			...super.update(),
			body('paidAt')
				.optional()
				.custom(value => DateUtils.isCorrectFormat(value, 'invoice_request_validation_paidAt_isDate'))
				.toDate(),
		]
	}
}
