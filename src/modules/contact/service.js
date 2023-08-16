import createError from 'http-errors'
import { Op } from 'sequelize'
import db from '@/database'
import { Contact } from '@/modules/contact/model'
import { User } from '@/modules/authentication/model'
import { BaseService } from '@/core/BaseService'
import { RoleService } from '@/modules/role/service'
import i18next from '../../../i18n'

export class ContactService extends BaseService {
	constructor() {
		super(Contact.getModelName(), 'contact_404')
	}

	async create(data) {
		const user = await db.models.User.findByPk(data.userId, {
			include: [{ model: Contact, as: 'contact' }],
		})
		if (!user) {
			throw createError(422, i18next.t('contact_422_inexistingUser'))
		}
		if (user.contact) {
			throw createError(422, i18next.t('contact_422_alreadyContact'))
		}

		return await super.create(data)
	}

	async getContactByRole(roleId) {
		const roleService = new RoleService()
		const role = await roleService.findOrFail(roleId)
		const subRoleIds = await roleService.getSubRoleIds(role)
		return await this.index({
			include: {
				model: User,
				as: 'user',
			},
			where: {
				'$user.roleId$': {
					[Op.in]: subRoleIds,
				},
			},
		})
	}
}
