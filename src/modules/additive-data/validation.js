import { body } from 'express-validator'
import { ArrayUtils } from '@/utils/ArrayUtils'
import i18next from '../../../i18n'

export class AdditiveDataValidator {
	static add() {
		return [
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
