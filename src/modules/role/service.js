import { BaseService } from '@/core/BaseService'

export class RoleService extends BaseService {
	static async index(options = {}) {
		return await super.index('Role', options)
	}

	static async single(id, options = {}) {
		return await super.single('Role', id, options)
	}

	static async findOrFail(id, options = {}) {
		return await super.findOrFail('Role', id, options, 'role_404')
	}
}
