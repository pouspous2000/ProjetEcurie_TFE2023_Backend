import { body } from 'express-validator'
import i18next from '../../../i18n'

export class HorseContributorJobValidator {
	static create() {
		return [
			body('name').exists().withMessage(i18next.t('horseContributorJob_request_validation_name_exists')),
			body('name')
				.isLength({ max: 255 })
				.withMessage(i18next.t('horseContributorJob_request_validation_name_length')),
		]
	}

	static update() {
		return this.create()
	}
}
