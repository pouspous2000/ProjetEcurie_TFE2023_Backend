import { body } from 'express-validator'
import i18next from '../../../i18n'

export class AuthenticationValidator {
	static register() {
		return [
			body('password').exists().withMessage(i18next.t('authentication_request_validation_password_exists')),
			body('passwordConfirm')
				.exists()
				.withMessage(i18next.t('authentication_request_validation_passwordConfirm_exists')),
			body('passwordConfirm')
				.custom((value, { req }) => value === req.body.password)
				.withMessage(i18next.t('authentication_request_validation_passwordConfirm_custom')),

			body('email').exists().withMessage(i18next.t('authentication_request_validation_email_exists')),
			body('email').isEmail().withMessage(i18next.t('authentication_request_validation_email_isEmail')),
		]
	}

	static login() {
		return [
			body('password').exists().withMessage(i18next.t('authentication_request_validation_password_exists')),
			body('email').exists().withMessage(i18next.t('authentication_request_validation_email_exists')),
			body('email').isEmail().withMessage(i18next.t('authentication_request_validation_email_isEmail')),
		]
	}

	static update() {
		return this.register()
	}
}
