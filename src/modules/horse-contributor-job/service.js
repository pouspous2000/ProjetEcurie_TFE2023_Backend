import { Op } from 'sequelize'
import createError from 'http-errors'
import db from '@/database'
import i18next from '../../../i18n'
import { CacheUtils } from '@/utils/CacheUtils'

export class HorseContributorJobService {
	static async index() {
		try {
			let keys = await CacheUtils.getAllKeysStartingWith('HorseContributorJob')
			if (!Array.isArray(keys)) {
				keys = []
			}
			const cacheValues = []
			const cacheIds = []

			for (const key of keys) {
				cacheValues.push(db.models.HorseContributorJob.build(await CacheUtils.get(key)))
				cacheIds.push(key.replace(/^HorseContributorJob_/, ''))
			}
			const dbValues = await db.models.HorseContributorJob.findAll({
				where: {
					id: {
						[Op.notIn]: cacheIds,
					},
				},
			})
			// [IMP] we could order by result but sequelize does not order by ... default => if we add such a scope impact here
			return [...dbValues, ...cacheValues]
		} catch (error) {
			return await db.models.HorseContributorJob.findAll()
		}
	}

	static async single(id) {
		return await db.models.HorseContributorJob.findByPk(id)
	}

	static async delete(horseContributorJobInstance) {
		return await horseContributorJobInstance.destroy()
	}

	static async create(data) {
		return await db.models.HorseContributorJob.create(data)
	}

	static async update(horseContributorJobInstance, data) {
		return await horseContributorJobInstance.set(data).save()
	}

	static async findOrFail(id) {
		const cacheKey = `HorseContributorJob_${id}`
		const cacheValue = await CacheUtils.get(cacheKey)
		if (cacheValue) {
			return db.models.HorseContributorJob.build(cacheValue)
		} else {
			const horseContributorJob = await db.models.HorseContributorJob.findByPk(id)
			if (!horseContributorJob) {
				throw createError(404, i18next.t('horseContributorJob_404'))
			}
			return horseContributorJob
		}
	}
}
