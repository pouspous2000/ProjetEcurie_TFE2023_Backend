import { body } from 'express-validator'
import i18next from '../../../i18n'

export class RoleValidator {
	static create() {
		return [...this._createUpdateCommon()]
	}

	static update() {
		return [...this._createUpdateCommon()]
	}

	static _createUpdateCommon() {
		return [
			body('name')
				.exists()
				.withMessage(i18next.t('role_request_validation_name_exists'))
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('role_request_validation_name_length')),
			body('parentId').isInt({ min: 1 }).withMessage(i18next.t('role_request_validation_parentId_isInt')),
		]
	}
}
