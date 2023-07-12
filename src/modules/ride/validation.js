import { body } from 'express-validator'
import i18next from '../../../i18n'

export class RideValidator {
	static create() {
		return [...this._createUpdateCommon()]
	}

	static _createUpdateCommon() {
		return [
			body('name').exists().withMessage(i18next.t('ride_request_validation_name_exists')),
			body('name').isLength({ min: 1, max: 255 }).withMessage(i18next.t('ride_request_validation_name_isLength')),
			body('period').exists().withMessage(i18next.t('ride_request_validation_period_exists')),
			body('period')
				.isIn(['WORKINGDAYS', 'WEEKEND', 'WEEK', 'DAY'])
				.withMessage(i18next.t('ride_request_validation_period_isIn')),
			body('price').exists().withMessage(i18next.t('ride_request_validation_price_exists')),
			body('price')
				.isDecimal({ decimal_digits: 2 })
				.withMessage(i18next.t('ride_request_validation_price_isDecimal')),
			body('price').custom(value => {
				if (Number.parseFloat(value) <= 0.0) {
					throw new Error(i18next.t('ride_request_validation_name_isPositive'))
				}
				return true
			}),
		]
	}
}
