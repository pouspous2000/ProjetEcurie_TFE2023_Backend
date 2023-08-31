export class ContactView {
	constructor() {}

	index(contacts) {
		return contacts.map(contact => {
			return this.show(contact)
		})
	}

	show(contact) {
		return {
			id: contact.id,
			firstName: contact.firstName,
			lastName: contact.lastName,
			phone: contact.phone,
			mobile: contact.mobile,
			address: contact.address,
			invoicingAddress: contact.invoicingAddress,
			createdAt: contact.createdAt,
			updatedAt: contact.updatedAt,
		}
	}

	create(contact) {
		return this.show(contact)
	}

	update(contact) {
		return this.show(contact)
	}

	indexContactByRoleCategory(contacts) {
		return contacts.map(contact => ({
			id: contact.id,
			firstName: contact.firstName,
			lastName: contact.lastName,
			phone: contact.phone,
			mobile: contact.mobile,
			address: contact.address,
			invoicingAddress: contact.invoicingAddress,
			createdAt: contact.createdAt,
			updatedAt: contact.updatedAt,
			userId: contact.userId,
			horses: contact.user.horses ? contact.user.horses.length : 0,
		}))
	}
}
