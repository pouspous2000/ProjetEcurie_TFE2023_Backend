import { body } from 'express-validator'
import { BaseValidator } from '@/core/BaseValidator'
import i18next from '../../../i18n'

export class ContactValidator extends BaseValidator {
	static create() {
		return [
			body('userId')
				.exists()
				.withMessage(i18next.t('contact_request_validation_userId_exists'))
				.isInt({ min: 1 })
				.withMessage(i18next.t('contact_request_validation_userId_isInt')),
			...this._createUpdateCommon(),
		]
	}

	static update() {
		return [...super.update(), ...this._createUpdateCommon()]
	}

	static _createUpdateCommon() {
		return [
			body('firstName')
				.exists()
				.withMessage(i18next.t('contact_request_validation_firstName_exists'))
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('contact_request_validation_firstName_length')),
			body('lastName')
				.exists()
				.withMessage(i18next.t('contact_request_validation_lastName_exists'))
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('contact_request_validation_lastName_length')),
			body('address').exists().withMessage(i18next.t('contact_request_validation_address_exists')),
			body('phone').isLength({ max: 255 }).withMessage(i18next.t('contact_request_validation_phone_isLength')),
			body('mobile').isLength({ max: 255 }).withMessage(i18next.t('contact_request_validation_mobile_isLength')),
			body('invoicingAddress').optional(),
		]
	}
}
