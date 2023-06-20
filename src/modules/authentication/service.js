import db from '@/database'
import createError from 'http-errors'
import i18next from '../../../i18n'

export class AuthenticationService {
	static async register(data) {
		return await db.models.User.create(data)
	}

	static async confirm(user) {
		if (user.status === 'ACTIVE') {
			throw createError(422, i18next.t('authentication_already_confirmed'))
		}
		user.status = 'ACTIVE'
		return await user.save()
	}
}
