import createError from 'http-errors'
import { SequelizeErrorFormatter } from '@/core/SequelizeErrorFormatter'
import { AuthenticationService } from '@/modules/authentication/service'
import { AuthenticationView } from '@/modules/authentication/views'
import { User } from '@/modules/authentication/model'
import i18next from '../../../i18n'

export class AuthenticationController {
	static async register(request, response, next) {
		try {
			const data = {
				email: request.body.email,
				password: request.body.password,
			}
			await AuthenticationService.register(data)
			return response.status(201).json(AuthenticationView.register())
		} catch (error) {
			const sqlError = new SequelizeErrorFormatter(error)
			if (sqlError) {
				return response.status(422).json(sqlError)
			}
			return next(error)
		}
	}

	static async confirm(request, response, next) {
		try {
			const { confirmationCode } = request.params
			const user = await User.findOne({
				where: {
					confirmationCode: confirmationCode,
				},
			})
			if (!user) {
				return next(createError(404, i18next.t('authentication_404')))
			}
			await AuthenticationService.confirm(user)
			return response.status(200).send(AuthenticationView.confirm())
		} catch (error) {
			if (error.status === 422) {
				return response.status(422).json(error)
			}
			return next(error)
		}
	}
}
