import { body } from 'express-validator'
import i18next from '../../../i18n'

export class HorseContributorValidator {
	static create() {
		return [...this._createUpdateCommon()]
	}

	static update() {
		return [...this._createUpdateCommon()]
	}

	static _createUpdateCommon() {
		return [
			body('firstName')
				.exists()
				.withMessage(i18next.t('horseContributor_request_validation_firstName_exists'))
				.isLength({
					min: 1,
					max: 255,
				})
				.withMessage(i18next.t('horseContributor_request_validation_firstName_length')),

			body('lastName')
				.exists()
				.withMessage(i18next.t('horseContributor_request_validation_lastName_exists'))
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('horseContributor_request_validation_lastName_length')),

			body('email')
				.exists()
				.withMessage(i18next.t('horseContributor_request_validation_email_exists'))
				.isEmail()
				.withMessage(i18next.t('horseContributor_request_validation_email_email')),
		]
	}
}
