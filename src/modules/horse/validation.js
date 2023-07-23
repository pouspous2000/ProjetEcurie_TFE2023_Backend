import { body } from 'express-validator'
import { ArrayUtils } from '@/utils/ArrayUtils'
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
			body('ownerId')
				.exists()
				.withMessage(i18next.t('horse_request_validation_ownerId_exists'))
				.isInt({ min: 1 })
				.withMessage(i18next.t('horse_request_validation_ownerId_isInt')),

			body('pensionId')
				.exists()
				.withMessage(i18next.t('horse_request_validation_pensionId_exists'))
				.isInt({ min: 1 })
				.withMessage(i18next.t('horse_request_validation_pensionId_isInt')),

			body('rideId').optional().isInt({ min: 1 }).withMessage(i18next.t('horse_request_validation_rideId_isInt')),

			body('name')
				.exists()
				.withMessage(i18next.t('horse_request_validation_name_exists'))
				.isLength({ min: 1, max: 255 })
				.withMessage(i18next.t('horse_request_validation_name_length')),

			body('comment').exists().withMessage(i18next.t('horse_request_validation_comment_exists')),

			body('horsemen')
				.exists()
				.withMessage(i18next.t('horse_request_validation_horsemen_exists'))
				.custom(horsemen =>
					ArrayUtils.validateFkArray(
						horsemen,
						'horse_request_validation_horsemen_isArray',
						'horse_request_validation_horsemen_horseman_isPositiveInteger',
						'horse_request_validation_horsemen_horseman_isPositiveInteger'
					)
				),
			body('additives')
				.exists()
				.withMessage(i18next.t('horse_request_validation_additives_exists'))
				.custom(additives =>
					ArrayUtils.validateFkArray(
						additives,
						'horse_request_validation_additives_isArray',
						'horse_request_validation_additives_isPositiveInteger',
						'horse_request_validation_additives_isPositiveInteger'
					)
				),
		]
	}
}
