import { Op } from 'sequelize'
import { BaseController } from '@/core/BaseController'
import { ContactService } from '@/modules/contact/service'
import { RoleService } from '@/modules/role/service'
import { User } from '@/modules/authentication/model'
import { ContactView } from '@/modules/contact/views'
import cloneDeep from 'lodash.clonedeep'

export class ContactController extends BaseController {
	constructor() {
		super(new ContactService(), new ContactView())
		this._roleService = new RoleService()
		this._getSingleOptionsFromRole = this._getSingleOptionsFromRole.bind(this)
		this._getIndexOptionsFromRole = this._getIndexOptionsFromRole.bind(this)
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
		this.delete = this.delete.bind(this)
	}

	async index(request, response, next) {
		await super.index(
			request,
			response,
			next,
			await this._getIndexOptionsFromRole(request.user.roleCategory, request.user.id)
		)
	}

	async show(request, response, next) {
		const { id } = request.params
		const options = await this._getSingleOptionsFromRole(id, request.user.roleCategory, request.user.id)
		await super.show(request, response, next, options)
	}

	async delete(request, response, next) {
		const { id } = request.params
		const options = await this._getSingleOptionsFromRole(id, request.user.roleCategory, request.user.id)
		await super.delete(request, response, next, options)
	}

	async _getIndexOptionsFromRole(roleCategory, userId) {
		switch (roleCategory) {
			case 'ADMIN':
				return {}
			case 'EMPLOYEE':
				return {
					include: [
						{
							model: User,
							as: 'user',
						},
					],
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
								userId: userId,
							},
						],
					},
				}
			case 'CLIENT':
				return {
					where: {
						userId: userId,
					},
				}
		}
	}

	async _getSingleOptionsFromRole(contactId, roleCategory, userId) {
		let options = await this._getIndexOptionsFromRole(roleCategory, userId)
		switch (roleCategory) {
			case 'ADMIN':
				options = {
					where: {
						id: contactId,
					},
				}
				break
			case 'EMPLOYEE':
				options.where = {
					[Op.and]: [{ id: contactId }, [cloneDeep(options.where)]],
				}
				break
			case 'CLIENT':
				options.where = {
					[Op.and]: [{ id: contactId }, [cloneDeep(options.where)]],
				}
		}
		return options
	}
}
