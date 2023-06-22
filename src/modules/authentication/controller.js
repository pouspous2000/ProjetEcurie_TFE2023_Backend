import { AuthenticationService } from '@/modules/authentication/service'
import { AuthenticationView } from '@/modules/authentication/views'

export class AuthenticationController {
	constructor() {
		this._service = new AuthenticationService()
		this._view = new AuthenticationView()
		this.register = this.register.bind(this)
		this.confirm = this.confirm.bind(this)
		this.login = this.login.bind(this)
		this.delete = this.delete.bind(this)
		this.update = this.update.bind(this)
	}

	async register(request, response, next) {
		try {
			const data = request.body
			await this._service.register(data)
			return response.status(201).json(this._view.register())
		} catch (error) {
			next(error)
		}
	}

	async confirm(request, response, next) {
		try {
			const { confirmationCode } = request.params
			await this._service.confirm(confirmationCode)
			return response.status(200).send(this._view.confirm())
		} catch (error) {
			next(error)
		}
	}

	async login(request, response, next) {
		try {
			const data = request.body
			return response.status(200).json(await this._service.login(data))
		} catch (error) {
			next(error)
		}
	}

	async delete(request, response, next) {
		try {
			const user = request.user
			await this._service.delete(user)
			return response.status(204).send()
		} catch (error) {
			next(error)
		}
	}

	async update(request, response, next) {
		try {
			const user = request.user
			const data = request.body
			await this._service.update(user, data)
			return response.status(200).json(this._view.update())
		} catch (error) {
			next(error)
		}
	}
}
