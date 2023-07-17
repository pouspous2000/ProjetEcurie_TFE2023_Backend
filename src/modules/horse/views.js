export class HorseView {
	constructor() {}

	index(horses) {
		return horses.map(horse => {
			return this.show(horse)
		})
	}

	show(horse) {
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
			pension: this._getPensionView(horse),
			ride: this._getRideView(horse),
			horsemen: this._getHorsemenView(horse),
			additives: this._getAdditivesView(horse),
		}
	}

	create(horse) {
		return this.show(horse)
	}

	update(horse) {
		return this.show(horse)
	}

	_getPensionView(horse) {
		if (horse.pension) {
			return {
				id: horse.pension.id,
				name: horse.pension.name,
				monthlyPrice: horse.pension.monthlyPrice,
				description: horse.pension.description,
			}
		}
		return null
	}

	_getRideView(horse) {
		if (horse.ride) {
			return {
				id: horse.ride.id,
				name: horse.ride.name,
				period: horse.ride.period,
				price: horse.ride.price,
			}
		}
		return null
	}

	_getHorsemenView(horse) {
		if (horse.horsemen.length) {
			return horse.horsemen.map(horseman => {
				return {
					email: horseman.email,
					userId: horseman.contact.userId,
					firstName: horseman.contact.firstName,
					lastName: horseman.contact.lastName,
					phone: horseman.contact.phone,
					mobile: horseman.contact.mobile,
					address: horseman.contact.address,
					invoicingAddress: horseman.contact.invoicingAddress,
				}
			})
		}
		return []
	}

	_getAdditivesView(horse) {
		if (horse.additives.length) {
			return horse.additives.map(additive => {
				return {
					id: additive.id,
					name: additive.name,
					price: additive.price,
				}
			})
		}
		return []
	}
}
