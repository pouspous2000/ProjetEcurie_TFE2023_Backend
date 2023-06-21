import createError from 'http-errors'
import i18next from 'i18next'

export class SequelizeErrorFormatter {
	// instance based as we could have different scenarios
	constructor(error) {
		if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
			const formattedErrors = []
			const formattedErrorKeys = []
			for (const err of error.errors) {
				if (!formattedErrorKeys.includes(err.path)) {
					formattedErrorKeys.push(err.path)
					formattedErrors.push({
						path: err.path,
						errors: [err.message],
					})
				} else {
					formattedErrors.find((formattedError, index) => {
						if (formattedError.path === err.path) {
							formattedErrors[index].errors.push(err.message)
						}
					})
				}
			}

			throw createError(422, {
				message: i18next.t('common_validation_error'),
				errors: formattedErrors,
			})
		}
		return undefined
	}
}
