import { Op } from 'sequelize'
import createError from 'http-errors'
import db from '@/database'
import { CacheUtils } from '@/utils/CacheUtils'
import i18next from '../../i18n'

export class BaseService {
	static async index(model) {
		try {
			let keys = await CacheUtils.getAllKeysStartingWith(model)
			if (!Array.isArray(keys)) {
				keys = []
			}
			const cacheValues = []
			const cacheIds = []
			const regex = new RegExp(`^${model}_`)

			for (const key of keys) {
				cacheValues.push(db.models[model].build(await CacheUtils.get(key)))
				cacheIds.push(key.replace(regex, ''))
			}
			const dbValues = await db.models[model].findAll({
				where: {
					id: {
						[Op.notIn]: cacheIds,
					},
				},
			})
			// [IMP] we could order by result but sequelize does not order by ... default => if we add such a scope impact here
			return [...dbValues, ...cacheValues]
		} catch (error) {
			return await db.models[model].findAll()
		}
	}

	static async single(model, id) {
		return await db.models[model].findByPk(id)
	}

	static async delete(instance) {
		return await instance.destroy()
	}

	static async create(model, data) {
		return await db.models[model].create(data)
	}

	static async update(instance, data) {
		return await instance.set(data).save()
	}

	static async findOrFail(model, id, translationKey = undefined) {
		const cacheKey = `${model}_${id}`
		const cacheValue = await CacheUtils.get(cacheKey)
		if (cacheValue) {
			return db.models[model].build(cacheValue)
		} else {
			const modelInstance = await db.models[model].findByPk(id)
			if (!modelInstance) {
				throw createError(404, i18next.t(translationKey ?? 'common_404'))
			}
			return modelInstance
		}
	}
}
