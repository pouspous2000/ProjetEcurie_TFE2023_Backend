import { body, query } from 'express-validator'
import i18next from '../../../i18n'

export class CompetitionValidator {
	static index() {
		return [
			query('creatorId')
				.optional()
				.isInt({ min: 1 })
				.withMessage(i18next.t('competition_request_validation_query_creatorId_isInt')),
			query('startingAt')
				.optional()
				.custom(value => {
					if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
						throw new Error(i18next.t('competition_request_validation_query_startingAt_isDate'))
					}
					return true
				})
				.toDate(),
			query('endingAt')
				.optional()
				.custom(value => {
					if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
						throw new Error(i18next.t('competition_request_validation_query_endingAt_isDate'))
					}
					return true
				})
				.toDate(),
			query('participants')
				.optional()
				.custom(participants => {
					if (typeof participants === 'string') {
						participants = participants.split(',')
					}
					if (!Array.isArray(participants)) {
						throw new Error(i18next.t('competition_request_validation_query_participants_isArray'))
					}
					participants.forEach(participant => {
						try {
							Number.parseInt(participant)
						} catch (error) {
							throw new Error(
								i18next.t('competition_request_validation_query_participants_isPositiveInteger')
							)
						}
					})

					participants.forEach(participant => {
						if (Number.parseInt(participant) <= 0) {
							throw new Error(
								i18next.t('competition_request_validation_query_participants_isPositiveInteger')
							)
						}
					})
					return true
				}),
		]
	}

	static create() {
		return [
			...this._createUpdateCommon(),
			body('participants').exists().withMessage(i18next.t('competition_request_validation_participants_exists')),
			body('participants').custom(participants => {
				if (!Array.isArray(participants)) {
					throw new Error(i18next.t('competition_request_validation_participants_isArray'))
				}
				participants.forEach(participant => {
					if (!Number.isInteger(participant) || participant <= 0) {
						throw new Error(i18next.t('competition_request_validation_participants_isPositiveInteger'))
					}
					return true
				})
				return true
			}),
		]
	}

	static _createUpdateCommon() {
		return [
			body('name').exists().withMessage(i18next.t('competition_request_validation_name_exists')),
			body('name')
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('competition_request_validation_name_isLength')),
			body('description').exists().withMessage(i18next.t('competition_request_validation_description_exists')),
			body('description')
				.isLength({ min: 1 })
				.withMessage(i18next.t('competition_request_validation_description_isLength')),
			body('startingAt').exists().withMessage(i18next.t('competition_request_validation_startingAt_exists')),
			body('startingAt')
				.custom(value => {
					if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
						throw new Error(i18next.t('competition_request_validation_startingAt_isDate'))
					}
					if (new Date() > new Date(value)) {
						throw new Error(i18next.t('competition_request_validation_startingAt_isAfterNow'))
					}
					return true
				})
				.toDate(),
			body('endingAt').exists().withMessage(i18next.t('competition_request_validation_endingAt_exists')),
			body('endingAt')
				.custom(value => {
					if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
						throw new Error(i18next.t('competition_request_validation_endingAt_isDate'))
					}
					return true
				})
				.toDate(),
			body('endingAt')
				.custom((value, { req }) => {
					const startingAt = new Date(req.body.startingAt)
					const endingAt = new Date(value)
					if (endingAt > startingAt) {
						return true
					}
					throw new Error(i18next.t('competition_request_validation_endingAt_isAfterStartingAt'))
				})
				.toDate(),
		]
	}
}
