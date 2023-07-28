import { body, query } from 'express-validator'
import { DateUtils } from '@/utils/DateUtils'
import { ArrayUtils } from '@/utils/ArrayUtils'
import { BaseValidator } from '@/core/BaseValidator'
import i18next from '../../../i18n'

export class EventValidator extends BaseValidator {
	static index() {
		return [
			query('creatorId')
				.optional()
				.isInt({ min: 1 })
				.withMessage(i18next.t('event_request_validation_query_creatorId_isInt')),
			query('startingAt')
				.optional()
				.custom(value => DateUtils.isCorrectFormat(value, 'event_request_validation_query_startingAt_isDate'))
				.toDate(),
			query('endingAt')
				.optional()
				.custom(value => DateUtils.isCorrectFormat(value, 'event_request_validation_query_endingAt_isDate'))
				.toDate(),
			query('participants')
				.optional()
				.custom(participants => this._validateParticipants(participants)),
		]
	}

	static create() {
		return [
			...this._createUpdateCommon(),
			body('participants')
				.exists()
				.withMessage(i18next.t('event_request_validation_participants_exists'))
				.custom(participants => this._validateParticipants(participants)),
		]
	}

	static update() {
		return [...super.update(), ...this._createUpdateCommon()]
	}

	static _createUpdateCommon() {
		return [
			body('name')
				.exists()
				.withMessage(i18next.t('event_request_validation_name_exists'))
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('event_request_validation_name_isLength')),
			body('description')
				.exists()
				.withMessage(i18next.t('event_request_validation_description_exists'))
				.isLength({ min: 1 })
				.withMessage(i18next.t('event_request_validation_description_isLength')),
			body('startingAt')
				.exists()
				.withMessage(i18next.t('event_request_validation_startingAt_exists'))
				.custom(value => DateUtils.isCorrectFormat(value, 'event_request_validation_startingAt_isDate'))
				.custom(value => {
					if (new Date() > new Date(value)) {
						throw new Error(i18next.t('event_request_validation_startingAt_isAfterNow'))
					}
					return true
				})
				.toDate(),
			body('endingAt')
				.exists()
				.withMessage(i18next.t('event_request_validation_endingAt_exists'))
				.custom(value => DateUtils.isCorrectFormat(value, 'event_request_validation_endingAt_isDate'))
				.custom((value, { req }) => {
					const startingAt = new Date(req.body.startingAt)
					const endingAt = new Date(value)
					if (endingAt > startingAt) {
						return true
					}
					throw new Error(i18next.t('event_request_validation_endingAt_isAfterStartingAt'))
				})
				.toDate(),
		]
	}

	static _validateParticipants(participants) {
		return ArrayUtils.validateFkArray(
			participants,
			'event_request_validation_participants_isArray',
			'event_request_validation_participants_isPositiveInteger',
			'event_request_validation_participants_isPositiveInteger'
		)
	}
}
