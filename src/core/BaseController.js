export class BaseController {
	constructor(service, policy = undefined, view = undefined) {
		this._service = service
		this._policy = policy
		this._view = view
	}

	async index(request, response, next, options = {}) {
		try {
			let instances = await this._service.index(options)
			if (this._policy && this._policy.index) {
				instances = await this._policy.index(request, instances)
			}
			return response.status(200).json(this._view && this._view.index ? this._view.index(instances) : instances)
		} catch (error) {
			return next(error)
		}
	}

	async show(request, response, next, options = {}) {
		try {
			const { id } = request.params
			const instance = await this._service.findOrFail(id, options)
			if (this._policy && this._policy.show) {
				await this._policy.show(request, instance)
			}
			return response.status(200).json(this._view && this._view.show ? this._view.show(instance) : instance)
		} catch (error) {
			return next(error)
		}
	}

	async delete(request, response, next, options = {}) {
		try {
			const { id } = request.params
			const instance = await this._service.findOrFail(id, options)
			if (this._policy && this._policy.delete) {
				await this._policy.delete(request, instance)
			}
			await this._service.delete(instance, options)
			return response.status(204).send()
		} catch (error) {
			next(error)
		}
	}

	async create(request, response, next, options = {}) {
		try {
			const data = request.body
			if (this._policy && this._policy.create) {
				await this._policy.create(request, data)
			}
			let instance = await this._service.create(data)
			if (Object.keys(options).length !== 0) {
				instance = await this._service.findOrFail(instance.id, options)
			}
			return response.status(201).json(this._view && this._view.create ? this._view.create(instance) : instance)
		} catch (error) {
			return next(error)
		}
	}

	async update(request, response, next, options = {}) {
		try {
			const { id } = request.params
			const data = request.body
			let instance = await this._service.findOrFail(id)
			if (this._policy && this._policy.update) {
				await this._policy.update(request, instance, data)
			}
			instance = await this._service.update(instance, data)
			if (Object.keys(options).length !== 0) {
				instance = await this._service.findOrFail(instance.id, options)
			}
			return response.status(200).json(this._view && this._view.update ? this._view.update(instance) : instance)
		} catch (error) {
			return next(error)
		}
	}
}
