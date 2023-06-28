import { body } from 'express-validator'
import i18next from '../../../i18n'

export class HorseValidator {
	static create() {
		return this._create_update_common()
	}

	static update() {
		return this._create_update_common()
	}

	static _create_update_common() {
		return [
			body('ownerId').exists().withMessage(i18next.t('horse_request_validation_ownerId_exists')),
			body('ownerId').isInt({ min: 1 }).withMessage(i18next.t('horse_request_validation_ownerId_isInt')),
			body('pensionId').exists().withMessage(i18next.t('horse_request_validation_pensionId_exists')),
			body('pensionId').isInt({ min: 1 }).withMessage(i18next.t('horse_request_validation_pensionId_isInt')),
			body('name').exists().withMessage(i18next.t('horse_request_validation_name_exists')),
			body('name').isLength({ min: 1, max: 255 }).withMessage(i18next.t('horse_request_validation_name_length')),
			body('comment').exists().withMessage(i18next.t('horse_request_validation_comment_exists')),
		]
	}
}
