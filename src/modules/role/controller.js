import { BaseController } from '@/core/BaseController'
import { RoleService } from '@/modules/role/service'
import { Role } from '@/modules/role/model'
import { RoleView } from '@/modules/role/views'

export class RoleController extends BaseController {
	constructor() {
		super(new RoleService(), new RoleView())
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
		this.delete = this.delete.bind(this)
		this.create = this.create.bind(this)
		this.update = this.update.bind(this)
	}

	async index(request, response, next) {
		await super.index(request, response, next, {
			include: [
				{ model: Role, as: 'children' },
				{ model: Role, as: 'parent' },
			],
		})
	}

	async show(request, response, next) {
		return await super.show(request, response, next, {
			include: [
				{ model: Role, as: 'children' },
				{ model: Role, as: 'parent' },
			],
		})
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
}
