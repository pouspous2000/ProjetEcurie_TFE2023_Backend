export class HorseView {
	constructor() {}

	index(horses) {
		return horses.map(horse => {
			return this.show(horse)
		})
	}

	show(horse) {
		const pensionView = !horse.pension
			? null
			: {
					name: horse.pension.name,
					monthlyPrice: horse.pension.monthlyPrice,
					description: horse.pension.description,
					// eslint-disable-next-line no-mixed-spaces-and-tabs
			  }
		return {
			id: horse.id,
			name: horse.name,
			comment: horse.comment,
			createdAt: horse.createdAt,
			updatedAt: horse.updatedAt,
			owner: {
				email: horse.owner.email,
				userId: horse.owner.contact.userId,
				firstName: horse.owner.contact.firstName,
				lastName: horse.owner.contact.lastName,
				phone: horse.owner.contact.phone,
				mobile: horse.owner.contact.mobile,
				address: horse.owner.contact.address,
				invoicingAddress: horse.owner.contact.invoicingAddress,
			},
			pension: pensionView,
		}
	}

	create(horse) {
		return this.show(horse)
	}

	update(horse) {
		return this.show(horse)
	}
}
