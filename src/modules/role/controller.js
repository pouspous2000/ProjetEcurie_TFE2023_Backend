import { RoleService } from '@/modules/role/service'
import { Role } from '@/modules/role/model'
import { RoleView } from '@/modules/role/views'

export class RoleController {
	static async index(request, response, next) {
		try {
			const roles = await RoleService.index({
				include: [
					{ model: Role, as: 'children' },
					{ model: Role, as: 'parent' },
				],
			})
			return response.status(200).json(roles)
		} catch (error) {
			return next(error)
		}
	}

	static async show(request, response, next) {
		const { id } = request.params
		try {
			const role = await RoleService.findOrFail(id, {
				include: [
					{ model: Role, as: 'children' },
					{ model: Role, as: 'parent' },
				],
			})
			return response.status(200).json(RoleView.single(role))
		} catch (error) {
			return next(error)
		}
	}
}
