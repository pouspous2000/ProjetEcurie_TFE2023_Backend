import i18next from 'i18next'

export class SequelizeErrorFormatter {
	// instance based as we could have different scenarios
	constructor(error) {
		if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
			return {
				message: i18next.t('common_validation_error'),
				errors: error.errors.map(err => {
					return {
						type: 'field',
						msg: err.message,
						path: err.path,
						location: 'body',
					}
				}),
			}
		}
		return undefined
	}
}
