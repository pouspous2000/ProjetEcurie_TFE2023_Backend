import { Contact } from '@/modules/contact/model'
import { BaseService } from '@/core/BaseService'
import { CacheUtils } from '@/utils/CacheUtils'
import db from '@/database'
import createError from 'http-errors'
import i18next from '../../../i18n'

export class ContactService extends BaseService {
	constructor() {
		super(Contact.getModelName(), 'contact_404')
	}

	async findOrFail(id, options = {}) {
		const cacheKey = `${this._model}_${id}`
		const cacheValue = await CacheUtils.get(cacheKey)
		if (cacheValue) {
			return db.models[this._model].build(cacheValue, options && options.include ? options.include : {})
		} else {
			const modelInstance = await db.models[this._model].findOne(options)
			if (!modelInstance) {
				throw createError(404, i18next.t(this._notFoundTranslationKey))
			}
			return modelInstance
		}
	}
}
