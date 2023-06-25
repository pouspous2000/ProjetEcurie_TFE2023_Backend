import { BaseController } from '@/core/BaseController'
import { ContactService } from '@/modules/contact/service'
import { RoleService } from '@/modules/role/service'
import { ContactPolicy } from '@/modules/contact/policies'
import { ContactView } from '@/modules/contact/views'

export class ContactController extends BaseController {
	constructor() {
		super(new ContactService(), new ContactPolicy(), new ContactView())
		this._roleService = new RoleService()
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
		this.delete = this.delete.bind(this)
	}
}
