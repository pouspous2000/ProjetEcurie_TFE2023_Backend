import { param } from 'express-validator'
import i18next from '../../i18n'

export class BaseValidator {
	static show(pk = 'id') {
		return this._validatePk(pk)
	}

	static delete(pk = 'id') {
		return this._validatePk(pk)
	}

	static update(pk = 'id') {
		return this._validatePk(pk)
	}

	static _validatePk(pk = 'id') {
		return [param(pk).isInt({ min: 1 }).withMessage(i18next.t('common_invalidId'))]
	}
}
