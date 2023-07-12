export class RideView {
	constructor() {}

	index(rides) {
		return rides.map(ride => {
			return this.show(ride)
		})
	}

	show(ride) {
		return {
			id: ride.id,
			name: ride.name,
			period: ride.period,
			price: ride.price,
			createdAt: ride.createdAt,
			updatedAt: ride.updatedAt,
			deletedAt: ride.deletedAt,
		}
	}

	create(ride) {
		return this.show(ride)
	}

	update(ride) {
		return this.show(ride)
	}
}
