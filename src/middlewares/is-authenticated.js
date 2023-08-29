import createError from 'http-errors'

export default function isAuthenticated(request, response, next) {
	if (!request.user) {
		return next(createError(401, 'authentication_notAuthenticated'))
	}
	return next()
}
