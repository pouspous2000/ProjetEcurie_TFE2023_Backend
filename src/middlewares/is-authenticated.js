import createError from 'http-errors'
import i18next from '../../i18n'

export default function isAuthenticated(request, response, next) {
	if (!request.user) {
		return next(createError(401, i18next.t('authentication_notAuthenticated')))
	}
	return next()
}
