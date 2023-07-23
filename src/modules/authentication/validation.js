import { body } from 'express-validator'
import i18next from '../../../i18n'

export class AuthenticationValidator {
	static registerClient() {
		return [
			body('password').exists().withMessage(i18next.t('authentication_request_validation_password_exists')),
			body('passwordConfirm')
				.exists()
				.withMessage(i18next.t('authentication_request_validation_passwordConfirm_exists'))
				.custom((value, { req }) => value === req.body.password)
				.withMessage(i18next.t('authentication_request_validation_passwordConfirm_custom')),
			body('email')
				.exists()
				.withMessage(i18next.t('authentication_request_validation_email_exists'))
				.isEmail()
				.withMessage(i18next.t('authentication_request_validation_email_isEmail')),
		]
	}

	static registerManually() {
		return [
			...this.registerClient(),
			body('roleId')
				.exists()
				.withMessage(i18next.t('authentication_request_validation_roleId_exists'))
				.isInt({ min: 1 })
				.withMessage(i18next.t('authentication_request_validation_roleId_isInt')),
		]
	}

	static login() {
		return [
			body('password').exists().withMessage(i18next.t('authentication_request_validation_password_exists')),
			body('email')
				.exists()
				.withMessage(i18next.t('authentication_request_validation_email_exists'))
				.isEmail()
				.withMessage(i18next.t('authentication_request_validation_email_isEmail')),
		]
	}

	static update() {
		return this.registerClient()
	}
}
