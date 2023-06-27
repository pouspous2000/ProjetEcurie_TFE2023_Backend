import { body } from 'express-validator'
import i18next from '../../../i18n'

export class AdditiveValidator {
	static create() {
		return [
			body('name').exists().withMessage(i18next.t('additive_request_validation_name_exists')),
			body('name')
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('additive_request_validation_name_length')),
			body('price').exists().withMessage(i18next.t('additive_request_validation_price_exists')),
			body('price')
				.isDecimal({ decimal_digits: 2 })
				.withMessage(i18next.t('additive_request_validation_price_decimal')),
		]
	}

	static update() {
		return this.create()
	}
}
