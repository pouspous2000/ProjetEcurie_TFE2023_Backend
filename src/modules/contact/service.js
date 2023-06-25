import db from '@/database'
import { Contact } from '@/modules/contact/model'
import { BaseService } from '@/core/BaseService'
import createError from 'http-errors'
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
}
