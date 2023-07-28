import { body } from 'express-validator'
import { BaseValidator } from '@/core/BaseValidator'
import i18next from '../../../i18n'

export class HorseContributorJobValidator extends BaseValidator {
	static create() {
		return [...this._createUpdateCommon()]
	}

	static update() {
		return [...super.update(), ...this._createUpdateCommon()]
	}

	static _createUpdateCommon() {
		return [
			body('name')
				.exists()
				.withMessage(i18next.t('horseContributorJob_request_validation_name_exists'))
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('horseContributorJob_request_validation_name_length')),
		]
	}
}
