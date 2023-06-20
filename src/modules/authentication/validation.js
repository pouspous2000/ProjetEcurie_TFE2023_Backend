import { body } from 'express-validator'
import i18next from '../../../i18n'

export class AuthenticationValidator {
	static register() {
		return [
			body('password').exists().withMessage(i18next.t('authentication_validation_password')),
			body('passwordConfirm')
				.exists()
				.withMessage(i18next.t('authentication_validation_passwordConfirm'))
				.custom((value, { req }) => value === req.body.password)
				.withMessage(i18next.t('authentication_validation_passwordConfirm')),
			body('email').exists().isEmail().withMessage(i18next.t('authentication_validation_email')),
		]
	}
}
