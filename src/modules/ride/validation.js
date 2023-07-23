import { body } from 'express-validator'
import i18next from '../../../i18n'

export class RideValidator {
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
				.withMessage(i18next.t('ride_request_validation_name_exists'))
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('ride_request_validation_name_isLength')),
			body('period')
				.exists()
				.withMessage(i18next.t('ride_request_validation_period_exists'))
				.isIn(['WORKINGDAYS', 'WEEKEND', 'WEEK', 'DAY'])
				.withMessage(i18next.t('ride_request_validation_period_isIn')),
			body('price')
				.exists()
				.withMessage(i18next.t('ride_request_validation_price_exists'))
				.isDecimal({ decimal_digits: 2 })
				.withMessage(i18next.t('ride_request_validation_price_isDecimal'))
				.custom(value => {
					if (Number.parseFloat(value) <= 0.0) {
						throw new Error(i18next.t('ride_request_validation_name_isPositive'))
					}
					return true
				}),
		]
	}
}
