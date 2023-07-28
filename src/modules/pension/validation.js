import { body } from 'express-validator'
import { BaseValidator } from '@/core/BaseValidator'
import i18next from '../../../i18n'

export class PensionValidator extends BaseValidator {
	static create() {
		return [...this._createUpdateCommon()]
	}

	static update() {
		return [...super.update(), ...this._createUpdateCommon()]
	}

	static _createUpdateCommon() {
		return [
			body('name')
				.exists()
				.withMessage(i18next.t('pension_request_validation_name_exists'))
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('pension_request_validation_name_length')),

			body('monthlyPrice')
				.exists()
				.withMessage(i18next.t('pension_request_validation_monthlyPrice_exists'))
				.isDecimal({ decimal_digits: 2 })
				.withMessage(i18next.t('pension_request_validation_monthlyPrice_decimal')),

			body('description').exists().withMessage(i18next.t('pension_request_validation_description_exists')),
		]
	}
}
