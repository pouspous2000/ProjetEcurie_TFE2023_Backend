export class BaseController {
	constructor(service, view = undefined) {
		this._service = service
		this._view = view
	}

	async index(request, response, next, options = {}) {
		try {
			const instances = await this._service.index(options)
			return response.status(200).json(this._view && this._view.index ? this._view.index(instances) : instances)
		} catch (error) {
			return next(error)
		}
	}

	async show(request, response, next, options = {}) {
		try {
			const { id } = request.params
			const instance = await this._service.findOrFail(id, options)
			return response.status(200).json(this._view && this._view.show ? this._view.show(instance) : instance)
		} catch (error) {
			return next(error)
		}
	}

	async delete(request, response, next) {
		try {
			const { id } = request.params
			await this._service.delete(id)
			return response.status(204).send()
		} catch (error) {
			next(error)
		}
	}

	async create(request, response, next) {
		try {
			const data = request.body
			const instance = await this._service.create(data)
			return response.status(201).json(this._view && this._view.create ? this._view.create(instance) : instance)
		} catch (error) {
			return next(error)
		}
	}

	async update(request, response, next) {
		try {
			const { id } = request.params
			const data = request.body
			const instance = await this._service.update(id, data)
			return response.status(200).json(this._view && this._view.update ? this._view.update(instance) : instance)
		} catch (error) {
			return next(error)
		}
	}
}
