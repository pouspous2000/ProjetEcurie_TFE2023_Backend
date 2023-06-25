import { Op } from 'sequelize'
import createError from 'http-errors'
import db from '@/database'
import { CacheUtils } from '@/utils/CacheUtils'
import i18next from '../../i18n'

export class BaseService {
	constructor(model, notFoundTranslationKey = 'common_404') {
		this._model = model
		this._notFoundTranslationKey = notFoundTranslationKey
	}

	async index(options = {}) {
		try {
			let keys = await CacheUtils.getAllKeysStartingWith(this._model)
			if (!Array.isArray(keys)) {
				keys = []
			}
			const cacheValues = []
			const cacheIds = []
			const regex = new RegExp(`^${this._model}_`)

			for (const key of keys) {
				cacheValues.push(db.models[this._model].build(await CacheUtils.get(key), options))
				cacheIds.push(key.replace(regex, ''))
			}
			const dbValues = await db.models[this._model].findAll({
				where: {
					id: {
						[Op.notIn]: cacheIds,
					},
				},
				...options,
			})
			return [...dbValues, ...cacheValues]
		} catch (error) {
			return await db.models[this._model].findAll()
		}
	}

	async single(id) {
		return await db.models[this._model].findByPk(id)
	}

	async delete(instance) {
		return await instance.destroy()
	}

	async create(data) {
		return await db.models[this._model].create(data)
	}

	async update(instance, data) {
		return await instance.set(data).save()
	}

	async findOrFail(id, options = {}) {
		const cacheKey = `${this._model}_${id}`
		const cacheValue = await CacheUtils.get(cacheKey)
		if (cacheValue) {
			return db.models[this._model].build(cacheValue, options)
		} else {
			const modelInstance = await db.models[this._model].findByPk(id, options)
			if (!modelInstance) {
				throw createError(404, i18next.t(this._notFoundTranslationKey))
			}
			return modelInstance
		}
	}
}
