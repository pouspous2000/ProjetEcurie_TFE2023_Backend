import createError from 'http-errors'
import db from '@/database'
import { TokenUtils } from '@/utils/TokenUtils'
import { RoleService } from '@/modules/role/service'

export default async function authenticate(request, response, next) {
	const authorization = request.headers.authorization || ''
	const refreshToken = request.headers.refreshtoken || ''

	response.setHeader('Token', 'invalidToken')
	response.setHeader('RefreshToken', 'invalidRefreshToken')
	response.setHeader('RoleCategory', 'CLIENT')
	response.setHeader('UserId', '0')

	request.user = null

	// check if bearer token
	if (!authorization || !authorization.startsWith('Bearer ')) {
		return next()
	}

	// extract data from the token
	const token = authorization.substring('Bearer '.length)
	response.setHeader('Token', token)
	response.setHeader('RefreshToken', refreshToken)

	const tokenData = await TokenUtils.verifyToken(token)

	if (!tokenData) {
		return next(createError(401, 'authentication_notAuthenticated'))
	}

	// find corresponding user and attach it to the request
	const user = await db.models.User.findByPk(tokenData.id).catch(() => null)
	if (!user) {
		return next(createError(401, 'authentication_notAuthenticated'))
	}

	request.user = user
	request.user.roleCategory = await new RoleService().getRoleCategory(request.user.roleId)
	response.setHeader('RoleCategory', request.user.roleCategory)
	response.setHeader('UserId', request.user.id)

	//check if token renewal time is close (15 minutes) and if so generate new tokens
	const now = new Date()
	const expiration = new Date(tokenData.exp * 1000)
	const difference = expiration.getTime() - now.getTime()
	const minutesLeft = Math.round(difference / 60000)

	if (refreshToken && minutesLeft < 15) {
		const refreshTokenData = await TokenUtils.verifyToken(refreshToken)
		if (refreshTokenData && refreshTokenData.id === tokenData.id) {
			const newToken = user.generateToken()
			const newRefreshToken = user.generateToken('2h')
			response.setHeader('Token', newToken)
			response.setHeader('RefreshToken', newRefreshToken)
		}
	}

	return next()
}
