import { body } from 'express-validator'
import i18next from '../../../i18n'

export class PensionValidator {
	static create() {
		return this._create_update_common()
	}

	static update() {
		return this._create_update_common()
	}

	static _create_update_common() {
		return [
			body('name').exists().withMessage(i18next.t('pension_request_validation_name_exists')),
			body('name')
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('pension_request_validation_name_length')),
			body('monthlyPrice').exists().withMessage(i18next.t('pension_request_validation_monthlyPrice_exists')),
			body('monthlyPrice')
				.isDecimal({ decimal_digits: 2 })
				.withMessage(i18next.t('pension_request_validation_monthlyPrice_decimal')),
			body('description').exists().withMessage(i18next.t('pension_request_validation_description_exists')),
		]
	}
}
