import createError from 'http-errors'
import db from '@/database'
import { TokenUtils } from '@/utils/TokenUtils'
import i18next from '../../i18n'

export default async function authenticate(request, response, next) {
	const authorization = request.headers.authorization || ''
	const refreshToken = request.headers.refreshtoken || ''

	request.user = null

	// check if bearer token
	if (!authorization || !authorization.startsWith('Bearer ')) {
		return next()
	}

	// extract data from the token
	const token = authorization.substring('Bearer '.length)
	const tokenData = await TokenUtils.verifyToken(token)

	// find corresponding user and attach it to the request
	const user = await db.models.User.findByPk(tokenData.id).catch(() => null)
	if (!user) {
		return next(createError(401, i18next.t('authentication_notAuthenticated')))
	}

	request.user = user

	//check if token renewal time is close (15 minutes) and if so generate new tokens
	const now = new Date()
	const expiration = new Date(tokenData.exp * 1000)
	const difference = expiration.getTime() - now.getTime()
	const minutesLeft = Math.round(difference / 60000)

	if (refreshToken && minutesLeft < 15) {
		const refreshTokenData = await TokenUtils.verifyToken(refreshToken)
		if (refreshTokenData.id === tokenData.id) {
			const newToken = user.generateToken()
			const newRefreshToken = user.generateToken('2h')
			response.setHeader('Token', newToken)
			response.setHeader('RefreshToken', newRefreshToken)
		}
	}

	return next()
}
