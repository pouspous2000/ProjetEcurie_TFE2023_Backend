import { body } from 'express-validator'
import i18next from '../../../i18n'

export class HorseContributorJobValidator {
	static create() {
		return [...this._createUpdateCommon()]
	}

	static update() {
		return [...this._createUpdateCommon()]
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
