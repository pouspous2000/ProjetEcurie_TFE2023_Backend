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
}
