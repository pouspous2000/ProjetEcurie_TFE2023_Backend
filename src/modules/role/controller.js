import { RoleService } from '@/modules/role/service'

export class RoleController {
	static async index(request, response, next) {
		try {
			const roles = await RoleService.index()
			return response.status(200).json(roles)
		} catch (error) {
			return next(error)
		}
	}

	static async show(request, response, next) {
		const { id } = request.params
		try {
			const role = await RoleService.findOrFail(id)
			return response.status(200).json(role)
		} catch (error) {
			return next(error)
		}
	}
}
