import { body } from 'express-validator'
import i18next from '../../../i18n'

export class HorseContributorValidator {
	static create() {
		// change me when horse is implemented
		return [
			body('firstName').exists().withMessage(i18next.t('horseContributor_request_validation_firstName_exists')),
			body('firstName')
				.isLength({
					min: 0,
					max: 255,
				})
				.withMessage(i18next.t('horseContributor_request_validation_firstName_length')),
			body('lastName').exists().withMessage(i18next.t('horseContributor_request_validation_lastName_exists')),
			body('lastName')
				.isLength({
					min: 0,
					max: 255,
				})
				.withMessage(i18next.t('horseContributor_request_validation_lastName_length')),
			body('email').exists().withMessage(i18next.t('horseContributor_request_validation_email_exists')),
			body('email').isEmail().withMessage(i18next.t('horseContributor_request_validation_email_email')),
		]
	}

	static update() {
		return this.create()
	}
}
