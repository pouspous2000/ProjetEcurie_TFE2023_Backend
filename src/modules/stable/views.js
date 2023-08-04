export class StableView {
	constructor() {}

	show(stable) {
		return {
			id: stable.id,
			name: stable.name,
			vat: stable.vat,
			address: stable.address,
			iban: stable.iban,
			phone: stable.phone,
			email: stable.email,
			invoicePrefix: stable.invoicePrefix ? stable.invoicePrefix : '',
			createdAt: stable.createdAt,
			updatedAt: stable.updatedAt,
		}
	}

	update(stable) {
		return this.show(stable)
	}
}
