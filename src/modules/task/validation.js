import { body, query } from 'express-validator'
import { DateUtils } from '@/utils/DateUtils'
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
				.custom(value => DateUtils.isCorrectFormat(value, 'task_request_validation_query_startingAt_isDate'))
				.toDate(),
			query('status')
				.optional()
				.isIn(['PENDING', 'CONFIRMED', 'IN PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED'])
				.withMessage(i18next.t('task_request_validation_query_status_isIn')),
		]
	}

	static create() {
		return [...this._createUpdateCommon()]
	}

	static update() {
		return [
			...this._createUpdateCommon(),
			body('creatorId')
				.exists()
				.withMessage(i18next.t('task_request_validation_creatorId_exists'))
				.isInt({ min: 1 })
				.withMessage(i18next.t('task_request_validation_creatorId_isInt')),
			body('remark').exists().withMessage(i18next.t('task_request_validation_remark_exists')),
			body('status')
				.exists()
				.withMessage(i18next.t('task_request_validation_status_exists'))
				.isIn(['PENDING', 'CONFIRMED', 'IN PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED'])
				.withMessage(i18next.t('task_request_validation_query_status_isIn')),
		]
	}

	static _createUpdateCommon() {
		return [
			body('employeeId')
				.exists()
				.withMessage(i18next.t('task_request_validation_employeeId_exists'))
				.isInt({ min: 1 })
				.withMessage(i18next.t('task_request_validation_employeeId_isInt')),
			body('name')
				.exists()
				.withMessage(i18next.t('task_request_validation_name_exists'))
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('task_request_validation_name_isLength')),
			body('description')
				.exists()
				.withMessage(i18next.t('task_request_validation_description_exists'))
				.isLength({ min: 1 })
				.withMessage(i18next.t('task_request_validation_description_isLength')),
			body('startingAt')
				.exists()
				.withMessage(i18next.t('task_request_validation_startingAt_exists'))
				.custom(value => DateUtils.isCorrectFormat(value, 'task_request_validation_startingAt_isDate'))
				.toDate(),
			body('endingAt')
				.exists()
				.withMessage(i18next.t('task_request_validation_endingAt_exists'))
				.custom(value => DateUtils.isCorrectFormat(value, 'task_request_validation_endingAt_isDate'))
				.custom((value, { req }) => {
					const startingAt = new Date(req.body.startingAt)
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
