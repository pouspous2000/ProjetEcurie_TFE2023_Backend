import { AuthenticationService } from '@/modules/authentication/service'
import { AuthenticationView } from '@/modules/authentication/views'

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
			return next(error)
		}
	}

	static async confirm(request, response, next) {
		try {
			const { confirmationCode } = request.params
			const user = await AuthenticationService.findUserByConfirmPasswordOrFail(confirmationCode)
			await AuthenticationService.confirm(user)
			return response.status(200).send(AuthenticationView.confirm())
		} catch (error) {
			return next(error)
		}
	}

	static async login(request, response, next) {
		try {
			const data = {
				email: request.body.email,
				password: request.body.password,
			}
			return response.status(200).json(await AuthenticationService.login(data))
		} catch (error) {
			next(error)
		}
	}

	static async delete(request, response, next) {
		try {
			const user = request.user
			await AuthenticationService.delete(user)
			return response.status(204).send()
		} catch (error) {
			next(error)
		}
	}
}
