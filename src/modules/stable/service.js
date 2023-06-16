import { BaseService } from '@/core/BaseService'

export class StableService extends BaseService {
	static async single(id) {
		return await super.single('Stable', id)
	}

	static async update(instance, data) {
		return await super.update(instance, data)
	}

	static async findOrFail(id) {
		return await super.findOrFail('Stable', id, 'stable_404')
	}
}
