import { body, query } from 'express-validator'
import { DateUtils } from '@/utils/DateUtils'
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
				.custom(value => DateUtils.isCorrectFormat(value))
				.toDate(),
		]
	}

	static create() {
		return [
			body('horseId')
				.exists()
				.withMessage(i18next.t('dailyRide_request_validation_horseId_exists'))
				.isInt({ min: 1 })
				.withMessage(i18next.t('dailyRide_request_validation_horseId_isInt')),
			...this._createUpdateCommon(),
		]
	}

	static update() {
		return [...this._createUpdateCommon()]
	}

	static _createUpdateCommon() {
		return [
			body('task')
				.isObject()
				.withMessage(i18next.t('dailyRide_request_validation_task_isObject'))
				.notEmpty()
				.withMessage(i18next.t('dailyRide_request_validation_task_notEmpty')),
			body('task.startingAt')
				.notEmpty()
				.withMessage(i18next.t('dailyRide_request_validation_taskStartingAt_notEmpty'))
				.custom(value =>
					DateUtils.isCorrectFormat(value, 'dailyRide_request_validation_query_taskStartingAt_isDate')
				)
				.custom(value => {
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
