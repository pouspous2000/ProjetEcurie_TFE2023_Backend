import createError from 'http-errors'
import db from '@/database'
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
		await this._getSinglePermissionsButCreate(request, contact)
	}

	async delete(request, contact) {
		await this._getSinglePermissionsButCreate(request, contact)
	}

	async create(request, data) {
		await this._getSinglePermissionCreate(request, { userId: data.userId })
	}

	async update(request, contact) {
		await this._getSinglePermissionsButCreate(request, contact)
	}

	async _getSinglePermissionsButCreate(request, contact) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				break
			case 'EMPLOYEE':
				// eslint-disable-next-line no-case-declarations
				const permittedContactsForEmployees = await this._getPermittedContactsForEmployee(request.user.id)
				if (!permittedContactsForEmployees.find(permittedContact => permittedContact.id === contact.id)) {
					throw createError(401, i18next.t('contact_401'))
				}
				break
			case 'CLIENT':
				if (contact.userId !== request.user.id) {
					throw createError(401, i18next.t('contact_401'))
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

	async _getSinglePermissionCreate(request, contact) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				break
			case 'EMPLOYEE':
				// we can create a contact for a client or for the employee itself
				// eslint-disable-next-line no-case-declarations
				const permittedUsers = await db.models.User.findAll({
					where: {
						[Op.or]: [
							{
								roleId: {
									[Op.in]: await this._roleService.getSubRoleIds(
										await this._roleService.getRoleByNameOrFail('CLIENT')
									),
								},
							},
							{
								id: request.user.id,
							},
						],
					},
				})
				if (!permittedUsers.find(user => user.id === contact.userId)) {
					throw createError(401, i18next.t('contact_401'))
				}
				break
			case 'CLIENT':
				if (contact.userId !== request.user.id) {
					throw createError(401, i18next.t('contact_401'))
				}
				break
		}
	}
}
