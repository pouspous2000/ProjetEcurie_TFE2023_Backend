import { body } from 'express-validator'
import { BaseValidator } from '@/core/BaseValidator'
import i18next from '../../../i18n'

export class StableValidator extends BaseValidator {
	static update() {
		return [
			...super.update(),
			body('name')
				.exists()
				.withMessage(i18next.t('stable_request_validation_name_exists'))
				.isLength({ max: 255 })
				.withMessage(i18next.t('stable_request_validation_name_length')),
			body('vat')
				.exists()
				.withMessage(i18next.t('stable_request_validation_vat_exists'))
				.isVAT('BE')
				.withMessage(i18next.t('stable_request_validation_vat_vat')),
			body('address')
				.exists()
				.withMessage(i18next.t('stable_request_validation_address_exists'))
				.isLength({ min: 1 })
				.withMessage('stable_request_validation_address_length'),
			body('iban')
				.exists()
				.withMessage(i18next.t('stable_request_validation_iban_exists'))
				.custom(value => {
					if (!new RegExp('^(BE\\d{2})(\\d{12})$').test(value)) {
						throw new Error(i18next.t('stable_request_validation_iban_format'))
					}
					return true
				}),
			body('phone')
				.exists()
				.withMessage(i18next.t('stable_request_validation_phone_exists'))
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('stable_request_validation_phone_length')),
			body('email')
				.exists()
				.withMessage(i18next.t('stable_request_validation_email_exists'))
				.isEmail()
				.withMessage(i18next.t('stable_request_validation_email_email')),
			body('invoicePrefix')
				.isLength({ max: 255 })
				.withMessage(i18next.t('stable_request_validation_invoicePrefix_length')),
		]
	}
}
