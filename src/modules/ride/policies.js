export class RidePolicy {
	constructor() {}

	async index(request, rides) {
		return rides
	}

	async show(request, ride) {
		return ride
	}
}
