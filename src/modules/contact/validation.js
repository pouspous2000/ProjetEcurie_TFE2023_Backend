import { body } from 'express-validator'
import i18next from '../../../i18n'

export class ContactValidator {
	static create() {
		return [
			body('userId').exists().withMessage(i18next.t('contact_request_validation_userId_exists')),
			body('userId').isInt({ min: 1 }).withMessage(i18next.t('contact_request_validation_userId_isInt')),
			...this._create_update_common(),
		]
	}

	static update() {
		return this._create_update_common()
	}

	static _create_update_common() {
		return [
			body('firstName').exists().withMessage(i18next.t('contact_request_validation_firstName_exists')),
			body('firstName')
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('contact_request_validation_firstName_length')),
			body('lastName').exists().withMessage(i18next.t('contact_request_validation_lastName_exists')),
			body('lastName')
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('contact_request_validation_lastName_length')),
			body('address').exists().withMessage(i18next.t('contact_request_validation_address_exists')),
			body('phone').isLength({ max: 255 }),
			body('mobile').isLength({ max: 255 }),
		]
	}
}
