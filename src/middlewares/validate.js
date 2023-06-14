import { validationResult } from 'express-validator'
import i18next from '../../i18n'

// note that this middleware is called on a route lvl (>< app lvl)
export default function (validations) {
	return async (request, response, next) => {
		await Promise.all(validations.map(validation => validation.run(request)))

		const errors = validationResult(request)
		if (errors.isEmpty()) {
			return next()
		}

		return response.status(422).json({
			message: i18next.t('common_validation_error'),
			errors: errors.array(),
		})
	}
}
