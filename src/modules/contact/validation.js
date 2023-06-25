import { body } from 'express-validator'
import i18next from '../../../i18n'

export class ContactValidator {
	static create() {
		return [
			body('userId').exists().withMessage(i18next.t('contact_request_validation_userId_exists')),
			body('userId').isInt({ min: 1 }).withMessage(i18next.t('contact_request_validation_userId_isInt')),
			body('firstName').exists().withMessage(i18next.t('contact_request_validation_firstName_exists')),
			body('firstName')
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('contact_request_validation_firstName_length')),
			body('lastName').exists().withMessage(i18next.t('contact_request_validation_lastName_exists')),
			body('lastName')
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('contact_request_validation_lastName_length')),
			body('address').exists().withMessage(i18next.t('contact_request_validation_address_exists')),
		]
	}
}
