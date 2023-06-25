import { Contact } from '@/modules/contact/model'
import { BaseService } from '@/core/BaseService'

export class ContactService extends BaseService {
	constructor() {
		super(Contact.getModelName(), 'contact_404')
	}
}
