import { BaseService } from '@/core/BaseService'

export class RoleService extends BaseService {
	static async index() {
		return await super.index('Role')
	}

	static async single(id) {
		return await super.single('Role', id)
	}

	static async findOrFail(id) {
		return await super.findOrFail('Role', id, 'role_404')
	}
}
