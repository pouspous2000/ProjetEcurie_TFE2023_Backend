import { RoleService } from '@/modules/role/service'
import { Role } from '@/modules/role/model'
import { RoleView } from '@/modules/role/views'
import { SequelizeErrorFormatter } from '@/core/SequelizeErrorFormatter'

export class RoleController {
	static async index(request, response, next) {
		try {
			const roles = await RoleService.index({
				include: [
					{ model: Role, as: 'children' },
					{ model: Role, as: 'parent' },
				],
			})
			return response.status(200).json(RoleView.index(roles))
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

	static async delete(request, response, next) {
		const { id } = request.params
		try {
			const role = await RoleService.findOrFail(id)
			await RoleService.delete(role)
			return response.status(204).send()
		} catch (error) {
			return next(error)
		}
	}

	static async create(request, response, next) {
		try {
			const data = request.body
			const role = await RoleService.create(data)
			return response.status(201).json(RoleView.create(role))
		} catch (error) {
			const sqlError = new SequelizeErrorFormatter(error)
			if (sqlError) {
				return response.status(422).json(sqlError)
			}
			return next(error)
		}
	}

	static async update(request, response, next) {
		try {
			const { id } = request.params
			const data = request.body
			const role = await RoleService.findOrFail(id)
			const updatedRole = await RoleService.update(role, data)
			return response.status(200).json(RoleView.update(updatedRole))
		} catch (error) {
			const sqlError = new SequelizeErrorFormatter(error)
			if (sqlError) {
				return response.status(422).json(sqlError)
			}
			return next(error)
		}
	}
}
