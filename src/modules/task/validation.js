import { body, query } from 'express-validator'
import i18next from '../../../i18n'

export class TaskValidator {
	static index() {
		return [
			query('employeeId')
				.optional()
				.isInt({ min: 1 })
				.withMessage(i18next.t('task_request_validation_query_employeeId_isInt')),
			query('creatorId')
				.optional()
				.isInt({ min: 1 })
				.withMessage(i18next.t('task_request_validation_query_creatorId_isInt')),
			query('startingAt')
				.optional()
				.custom(value => {
					if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
						throw new Error(i18next.t('task_request_validation_query_startingAt_isDate'))
					}
					return true
				})
				.toDate(),
			query('status')
				.optional()
				.isIn(['PENDING', 'CONFIRMED', 'IN PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED'])
				.withMessage(i18next.t('task_request_validation_query_status_isIn')),
		]
	}

	static create() {
		return [
			body('employeeId').exists().withMessage(i18next.t('task_request_validation_employeeId_exists')),
			body('employeeId').isInt({ min: 1 }).withMessage(i18next.t('task_request_validation_employeeId_isInt')),
			body('name').exists().withMessage(i18next.t('task_request_validation_name_exists')),
			body('name').isLength({ min: 1, max: 255 }).withMessage(i18next.t('task_request_validation_name_isLength')),
			body('description').exists().withMessage(i18next.t('task_request_validation_description_exists')),
			body('description')
				.isLength({ min: 1 })
				.withMessage(i18next.t('task_request_validation_description_isLength')),
			body('startingAt').exists().withMessage(i18next.t('task_request_validation_startingAt_exists')),
			body('startingAt')
				.custom(value => {
					if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
						throw new Error(i18next.t('task_request_validation_startingAt_isDate'))
					}
					return true
				})
				.toDate(),
			body('endingAt').exists().withMessage(i18next.t('task_request_validation_endingAt_exists')),
			body('endingAt')
				.custom(value => {
					if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
						throw new Error(i18next.t('task_request_validation_endingAt_isDate'))
					}
					return true
				})
				.toDate(),
			body('endingAt')
				.custom((value, { request }) => {
					const startingAt = new Date(request.body.startingAt)
					const endingAt = new Date(value)
					if (endingAt > startingAt) {
						return true
					}
					throw new Error(i18next.t('task_request_validation_endingAt_isAfterStartingAt'))
				})
				.toDate(),
		]
	}
}
