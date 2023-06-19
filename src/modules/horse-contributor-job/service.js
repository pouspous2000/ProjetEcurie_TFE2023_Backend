import { BaseService } from '@/core/BaseService'

export class HorseContributorJobService extends BaseService {
	// [IMP] it now makes sens to use instance methods as we need the modelName everywhere
	static async index(options = {}) {
		return await super.index('HorseContributorJob', options)
	}

	static async single(id, options = {}) {
		return await super.single('HorseContributorJob', id, options)
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

	static async findOrFail(id, options = {}) {
		return await super.findOrFail('HorseContributorJob', id, options, 'horseContributorJob_404')
	}
}
