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
			additiveDatas: this._getAdditiveDatasView(horse),
			horseContributorHorseContributorJobs: this._getHorseContributorHorseContributorJobs(horse),
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
		if (horse.horsemen && horse.horsemen.length) {
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

	_getAdditiveDatasView(horse) {
		if (horse.additiveDatas && horse.additiveDatas.length) {
			return horse.additiveDatas.map(additiveData => {
				return {
					id: additiveData.id,
					additiveId: additiveData.additiveId,
					name: additiveData.name,
					price: additiveData.price,
					status: additiveData.status,
				}
			})
		}
		return []
	}

	_getHorseContributorHorseContributorJobs(horse) {
		if (horse.horseContributorHorseContributorJobs && horse.horseContributorHorseContributorJobs.length) {
			return horse.horseContributorHorseContributorJobs.map(data => ({
				id: data.id,
				horseContributor: {
					id: data.horseContributor.id,
					firstName: data.horseContributor.firstName,
					lastName: data.horseContributor.lastName,
					email: data.horseContributor.email,
				},
				horseContributorJob: {
					id: data.horseContributorJob.id,
					name: data.horseContributorJob.name,
				},
				createdAt: data.createdAt,
				updatedAt: data.updatedAt,
			}))
		}
		return []
	}
}
