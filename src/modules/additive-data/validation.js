import { body } from 'express-validator'
import { ArrayUtils } from '@/utils/ArrayUtils'
import { BaseValidator } from '@/core/BaseValidator'
import i18next from '../../../i18n'

export class AdditiveDataValidator extends BaseValidator {
	static add() {
		return [
			...super.show('horseId'),
			body('additiveIds')
				.exists()
				.withMessage(i18next.t('additiveData_request_validation_additiveIds_exists'))
				.custom(additiveIds =>
					ArrayUtils.validateFkArray(
						additiveIds,
						'additiveData_request_validation_additiveIds_isArray',
						'additiveData_request_validation_additiveIds_isPositiveInteger',
						'additiveData_request_validation_additiveIds_isPositiveInteger'
					)
				),
		]
	}

	static cancel() {
		return [
			...super.show('horseId'),
			body('additiveDataIds')
				.exists()
				.withMessage(i18next.t('additiveData_request_validation_additiveDataIds_exists'))
				.custom(additiveDataIds =>
					ArrayUtils.validateFkArray(
						additiveDataIds,
						'additiveData_request_validation_additiveDataIds_isArray',
						'additiveData_request_validation_additiveDataIds_isPositiveInteger',
						'additiveData_request_validation_additiveDataIds_isPositiveInteger'
					)
				),
		]
	}
}
