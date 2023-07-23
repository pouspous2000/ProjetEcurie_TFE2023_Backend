import { BaseService } from '@/core/BaseService'
import { Role } from '@/modules/role/model'
import createError from 'http-errors'
import i18next from '../../../i18n'
import db from '@/database/index'
import { Op } from 'sequelize'
import { User } from '@/modules/authentication/model'
import { ModelCacheHooksUtils } from '@/utils/CacheUtils'

export class RoleService extends BaseService {
	constructor() {
		super(Role.getModelName(), 'role_404')
	}

	async delete(role) {
		if (!role.isEditable) {
			throw createError(401, i18next.t('role_crud_record_unauthorized'))
		}
		const subRoleIds = await this.getSubRoleIds(role)
		const parentRoleId = role.parentId

		await db.transaction(async transaction => {
			await User.update(
				{ roleId: parentRoleId },
				{
					where: {
						roleId: {
							[Op.in]: subRoleIds,
						},
					},
					transaction: transaction,
				}
			)
			await db.models.Role.destroy({
				where: {
					id: {
						[Op.in]: subRoleIds,
					},
				},
				transaction: transaction,
			})
		})
		await ModelCacheHooksUtils.clearModelCache(Role.getModelName())
	}

	async create(data) {
		data.isEditable = true
		const parentRole = await db.models.Role.findByPk(data.parentId)
		if (!parentRole) {
			throw createError(422, i18next.t('role_422_inexistingParentRole'))
		}
		return await super.create(data)
	}

	async update(role, data) {
		if (!role.isEditable) {
			throw createError(422, i18next.t('role_crud_record_unauthorized'))
		}
		const parentRole = await db.models.Role.findByPk(data.parentId)
		if (!parentRole) {
			throw createError(422, i18next.t('role_422_inexistingParentRole'))
		}
		return await role.set(data).save()
	}

	async getRoleCategory(id) {
		// returns the "category of a role" i.e. ADMIN | EMPLOYEE | CLIENT
		let rootParent = await db.models.Role.findByPk(id)
		while (rootParent.parentId) {
			rootParent = await db.models.Role.findByPk(rootParent.parentId)
		}
		return rootParent.name
	}

	async getSubRoleIds(role) {
		const subRoleIds = [role.id]
		let currentParentRoleIds = [role.id]
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const directSubRoles = await db.models.Role.findAll({
				where: {
					parentId: {
						[Op.in]: currentParentRoleIds,
					},
				},
			})
			if (directSubRoles.length) {
				subRoleIds.push(...directSubRoles.map(subRole => subRole.id))
				currentParentRoleIds = directSubRoles.map(subRole => subRole.id)
			} else {
				break
			}
		}
		return subRoleIds
	}

	async getRoleByNameOrFail(name) {
		const role = await db.models.Role.findOne({
			where: {
				name: {
					[Op.eq]: name,
				},
			},
		})
		if (!role) {
			throw createError(404, i18next.t('role_404'))
		}
		return role
	}
}
