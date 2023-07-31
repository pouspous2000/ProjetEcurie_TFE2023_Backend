export class InvoiceView {
	constructor() {}

	index(invoices) {
		return invoices.map(invoice => this.show(invoice))
	}

	show(invoice) {
		return {
			id: invoice.id,
			client: this._getClientView(invoice),
			cron: this._getCronView(invoice),
			number: invoice.number,
			price: invoice.price,
			status: invoice.status,
			dueDateAt: invoice.dueDateAt,
			paidAt: invoice.paidAt,
			createdAt: invoice.createdAt,
			updatedAt: invoice.updatedAt,
			isUnpaidAfterDueDateAt: invoice.status === 'UNPAID' && new Date() > invoice.dueDateAt,
		}
	}

	markAsPaid(invoice) {
		return this.show(invoice)
	}

	markAsUnpaid(invoice) {
		return this.show(invoice)
	}

	_getClientView(invoice) {
		if (invoice.client) {
			return {
				email: invoice.client.email,
				userId: invoice.client.contact.userId,
				firstName: invoice.client.contact.firstName,
				lastName: invoice.client.contact.lastName,
				phone: invoice.client.contact.phone,
				mobile: invoice.client.contact.mobile,
				address: invoice.client.contact.address,
				invoicingAddress: invoice.client.contact.invoicingAddress,
			}
		}
		return null
	}

	_getCronView(invoice) {
		if (invoice.cron) {
			return {
				id: invoice.cron.id,
				name: invoice.cron.name,
				step: invoice.cron.step,
				status: invoice.cron.status,
			}
		}
		return null
	}
}
