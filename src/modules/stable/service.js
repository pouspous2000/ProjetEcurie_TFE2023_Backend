import { BaseService } from '@/core/BaseService'

export class StableService extends BaseService {
	static async single(id, options = {}) {
		return await super.single('Stable', id, options)
	}

	static async update(instance, data) {
		return await super.update(instance, data)
	}

	static async findOrFail(id, options = {}) {
		return await super.findOrFail('Stable', id, options, 'stable_404')
	}
}
