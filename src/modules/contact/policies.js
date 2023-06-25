import createError from 'http-errors'
import { Op } from 'sequelize'
import { RoleService } from '@/modules/role/service'
import { ContactService } from '@/modules/contact/service'
import { User } from '@/modules/authentication/model'
import i18next from '../../../i18n'

export class ContactPolicy {
	constructor() {
		this._roleService = new RoleService()
		this._contactService = new ContactService()
	}

	async index(request, contacts) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return contacts
			case 'EMPLOYEE':
				return await this._getPermittedContactsForEmployee(request.user.id)
			case 'CLIENT':
				return contacts.filter(contact => contact.userId === request.user.id)
		}
	}

	async show(request, contact) {
		await this._getSinglePermissions(request, contact)
	}

	async delete(request, contact) {
		await this._getSinglePermissions(request, contact)
	}

	async _getSinglePermissions(request, contact) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				break
			case 'EMPLOYEE':
				if (
					!(await this._getPermittedContactsForEmployee(request.user.id)).find(
						permittedContact => permittedContact.id === contact.id
					)
				) {
					throw createError(401, i18next.t('contact_unauthorized'))
				}
				break
			case 'CLIENT':
				if (contact.userId !== request.user.id) {
					throw createError(401, i18next.t('contact_unauthorized'))
				}
				break
		}
	}

	async _getPermittedContactsForEmployee(employeeId) {
		return await this._contactService.index({
			include: [{ model: User, as: 'user' }],
			where: {
				[Op.or]: [
					{
						'$user.roleId$': {
							[Op.in]: await this._roleService.getSubRoleIds(
								await this._roleService.getRoleByNameOrFail('CLIENT')
							),
						},
					},
					{
						userId: employeeId,
					},
				],
			},
		})
	}
}
