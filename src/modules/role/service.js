import { BaseService } from '@/core/BaseService'
import { Role } from '@/modules/role/model'
import createError from 'http-errors'
import i18next from '../../../i18n'

export class RoleService extends BaseService {
	constructor() {
		super(Role.getModelName(), 'role_404')
	}

	async delete(id) {
		const role = await this.findOrFail(id)
		if (!role.isEditable) {
			throw createError(401, i18next.t('role_crud_record_unauthorized'))
		}
		return await role.destroy()
	}

	async create(data) {
		data.isEditable = true
		return await super.create(data)
	}

	async update(id, data) {
		const role = await this.findOrFail(id)
		if (!role.isEditable) {
			throw createError(401, i18next.t('role_crud_record_unauthorized'))
		}
		return await role.set(data).save()
	}
}
