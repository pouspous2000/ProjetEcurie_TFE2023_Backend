import { query } from 'express-validator'
import i18next from '../../../i18n'

export class LessonValidator {
	static index() {
		return [
			query('creatorId')
				.optional()
				.isInt({ min: 1 })
				.withMessage(i18next.t('lesson_request_validation_query_creatorId_isInt')),
			query('clientId')
				.optional()
				.isInt({ min: 1 })
				.withMessage(i18next.t('lesson_request_validation_query_clientId_isInt')),
			query('startingAt')
				.optional()
				.custom(value => {
					if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
						throw new Error(i18next.t('lesson_request_validation_query_startingAt_isDate'))
					}
					return true
				})
				.toDate(),
			query('status')
				.optional()
				.isIn(['CONFIRMED', 'DONE', 'CANCELLED', 'ABSENCE'])
				.withMessage(i18next.t('lesson_request_validation_query_status_isIn')),
		]
	}
}
