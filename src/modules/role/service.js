import { BaseService } from '@/core/BaseService'
import createError from 'http-errors'
import i18next from '../../../i18n'

export class RoleService extends BaseService {
	static async index(options = {}) {
		return await super.index('Role', options)
	}

	static async single(id, options = {}) {
		return await super.single('Role', id, options)
	}

	static async delete(instance) {
		if (!instance.isEditable) {
			throw createError(401, i18next.t('role_crud_record_unauthorized'))
		}
		return await super.delete(instance)
	}

	static async create(data) {
		data.isEditable = true
		await this.findOrFail(data.parentId)
		return await super.create('Role', data)
	}

	static async update(instance, data) {
		if (!instance.isEditable) {
			throw createError(401, i18next.t('role_crud_record_unauthorized'))
		}
		data.isEditable = true
		await this.findOrFail(data.parentId)
		return await super.update(instance, data)
	}

	static async findOrFail(id, options = {}) {
		return await super.findOrFail('Role', id, options, 'role_404')
	}
}
