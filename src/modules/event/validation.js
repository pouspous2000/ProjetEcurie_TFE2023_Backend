import { query } from 'express-validator'
import i18next from '../../../i18n'

export class EventValidator {
	static index() {
		return [
			query('creatorId')
				.optional()
				.isInt({ min: 1 })
				.withMessage(i18next.t('event_request_validation_query_creatorId_isInt')),
			query('startingAt')
				.optional()
				.custom(value => {
					if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
						throw new Error(i18next.t('event_request_validation_query_startingAt_isDate'))
					}
					return true
				})
				.toDate(),
			query('endingAt')
				.optional()
				.custom(value => {
					if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
						throw new Error(i18next.t('event_request_validation_query_endingAt_isDate'))
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
						throw new Error(i18next.t('event_request_validation_query_participants_isArray'))
					}
					participants.forEach(participant => {
						try {
							Number.parseInt(participant)
						} catch (error) {
							throw new Error(i18next.t('event_request_validation_query_participants_isPositiveInteger'))
						}
					})

					participants.forEach(participant => {
						if (Number.parseInt(participant) <= 0) {
							throw new Error(i18next.t('event_request_validation_query_participants_isPositiveInteger'))
						}
					})
					return true
				}),
		]
	}
}
