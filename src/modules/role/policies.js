import createError from 'http-errors'
import i18next from '../../../i18n'
import { RoleService } from '@/modules/role/service'

export class RolePolicy {
	async index(request, roles) {
		return roles
	}

	async show(request, role) {
		return role
	}

	async delete(request, role) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return role
			case 'EMPLOYEE':
				if (['ADMIN', 'EMPLOYEE'].includes(await this._getRoleCategory(role.id))) {
					throw createError(401, i18next.t('role_401'))
				}
				return role
			case 'CLIENT':
				// this should never be called confer middleware
				throw createError(401, i18next.t('role_401'))
		}
	}

	async create(request, data) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return data
			case 'EMPLOYEE':
				if (['ADMIN', 'EMPLOYEE'].includes(await this._getRoleCategory(data.parentId))) {
					throw createError(401, i18next.t('role_401'))
				}
				return data
			case 'CLIENT':
				// this should never be called confer middleware
				throw createError(401, i18next.t('role_401'))
		}
	}

	async update(request, role, data) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return role
			case 'EMPLOYEE':
				if (['ADMIN', 'EMPLOYEE'].includes(await this._getRoleCategory(data.parentId))) {
					throw createError(401, i18next.t('role_401'))
				}
				return data
			case 'CLIENT':
				// this should never be called confer middleware
				throw createError(401, i18next.t('role_401'))
		}
	}

	async _getRoleCategory(roleId) {
		const roleCategory = await new RoleService().getRoleCategory(roleId)

		if (!['ADMIN', 'EMPLOYEE', 'CLIENT'].includes(roleCategory)) {
			throw createError(401, i18next.t('authentication_role_incorrectRolePermission'))
		}

		return roleCategory
	}
}
