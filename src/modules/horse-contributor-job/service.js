import { BaseService } from '@/core/BaseService'

export class HorseContributorJobService extends BaseService {
	// [IMP] it now makes sens to use instance methods as we need the modelName everywhere
	static async index() {
		return await super.index('HorseContributorJob')
	}

	static async single(id) {
		return await super.single('HorseContributorJob', id)
	}

	static async delete(instance) {
		return await super.delete(instance)
	}

	static async create(data) {
		return await super.create('HorseContributorJob', data)
	}

	static async update(instance, data) {
		return await super.update(instance, data)
	}

	static async findOrFail(id) {
		return await super.findOrFail('HorseContributorJob', id, 'horseContributorJob_404')
	}
}
