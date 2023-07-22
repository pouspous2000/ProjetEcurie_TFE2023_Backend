import { body, query } from 'express-validator'
import i18next from '../../../i18n'

export class DailyRideValidator {
	static index() {
		return [
			query('horseId')
				.optional()
				.isInt({ min: 1 })
				.withMessage(i18next.t('dailyRide_request_validation_query_horseId_isInt')),
			query('horseName')
				.optional()
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('dailyRide_request_validation_query_horseName_isLength')),
			query('taskStatus')
				.optional()
				.isIn(['PENDING', 'CONFIRMED', 'IN PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED'])
				.withMessage(i18next.t('dailyRide_request_validation_query_taskStatus_isIn')),
			query('taskStartingAt')
				.optional()
				.custom(value => {
					if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
						throw new Error(i18next.t('dailyRide_request_validation_query_taskStartingAt_isDate'))
					}
					return true
				})
				.toDate(),
		]
	}

	static create() {
		return [
			body('horseId').exists().withMessage(i18next.t('dailyRide_request_validation_horseId_exists')),
			body('horseId').isInt({ min: 1 }).withMessage(i18next.t('dailyRide_request_validation_horseId_isInt')),
			body('task')
				.isObject()
				.withMessage(i18next.t('dailyRide_request_validation_task_isObject'))
				.notEmpty()
				.withMessage(i18next.t('dailyRide_request_validation_task_notEmpty')),
			body('task.startingAt')
				.notEmpty()
				.withMessage(i18next.t('dailyRide_request_validation_taskStartingAt_notEmpty'))
				.custom(value => {
					if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
						throw new Error(i18next.t('dailyRide_request_validation_taskStartingAt_isDate'))
					}
					if (new Date() > new Date(value)) {
						throw new Error(i18next.t('dailyRide_request_validation_taskStartingAt_isBeforeNow'))
					}
					return true
				})
				.toDate(),
			body('task.remark')
				.optional()
				.isLength({ min: 1 })
				.withMessage(i18next.t('dailyRide_request_validation_taskRemark_isLength')),
		]
	}
}
