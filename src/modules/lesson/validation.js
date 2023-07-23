import { body, query } from 'express-validator'
import { DateUtils } from '@/utils/DateUtils'
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
				.custom(value => DateUtils.isCorrectFormat(value, 'lesson_request_validation_query_startingAt_isDate'))
				.toDate(),
			query('status')
				.optional()
				.isIn(['CONFIRMED', 'DONE', 'CANCELLED', 'ABSENCE'])
				.withMessage(i18next.t('lesson_request_validation_query_status_isIn')),
		]
	}

	static create() {
		return [
			body('clientId')
				.exists()
				.withMessage(i18next.t('lesson_request_validation_clientId_exists'))
				.isInt({ min: 1 })
				.withMessage(i18next.t('lesson_request_validation_clientId_isInt')),
			body('startingAt').exists().withMessage(i18next.t('lesson_request_validation_startingAt_exists')),
			...this._createUpdateCommon(),
		]
	}

	static update() {
		return [
			...this._createUpdateCommon(),
			body('status')
				.exists()
				.withMessage(i18next.t('lesson_request_validation_status_exists'))
				.isIn(['CONFIRMED', 'DONE', 'CANCELLED', 'ABSENCE'])
				.withMessage(i18next.t('lesson_request_validation_query_status_isIn')),
		]
	}

	static _createUpdateCommon() {
		return [
			body('startingAt')
				.custom(value => DateUtils.isCorrectFormat(value, 'lesson_request_validation_startingAt_isDate'))
				.toDate(),

			body('endingAt')
				.exists()
				.withMessage(i18next.t('lesson_request_validation_endingAt_exists'))
				.custom(value => DateUtils.isCorrectFormat(value, 'lesson_request_validation_endingAt_isDate'))
				.custom((value, { req }) => {
					const startingAt = new Date(req.body.startingAt)
					const endingAt = new Date(value)
					if (endingAt > startingAt) {
						return true
					}
					throw new Error(i18next.t('lesson_request_validation_endingAt_isAfterStartingAt'))
				})
				.toDate(),
		]
	}
}
