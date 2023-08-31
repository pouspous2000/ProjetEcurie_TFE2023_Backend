import { BaseController } from '@/core/BaseController'
import { ContactService } from '@/modules/contact/service'
import { ContactPolicy } from '@/modules/contact/policies'
import { ContactView } from '@/modules/contact/views'

export class ContactController extends BaseController {
	constructor() {
		super(new ContactService(), new ContactPolicy(), new ContactView())
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
		this.delete = this.delete.bind(this)
		this.create = this.create.bind(this)
		this.update = this.update.bind(this)
		this.getContactByRole = this.getContactByRole.bind(this)
		this.getContactByRoleCategory = this.getContactByRoleCategory.bind(this)
	}

	async getContactByRole(request, response, next) {
		try {
			const { roleId } = request.params
			const contacts = await this._service.getContactByRole(roleId)
			return response.status(200).json(this._view.index(contacts))
		} catch (error) {
			return next(error)
		}
	}

	async getContactByRoleCategory(request, response, next) {
		try {
			const { roleCategory } = request.params
			const contacts = await this._service.getContactsByRoleCategory(roleCategory)
			return response.status(200).json(this._view.indexContactByRoleCategory(contacts))
		} catch (error) {
			next(error)
		}
	}
}
