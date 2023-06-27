export class HorseContributorView {
	constructor() {}

	index(horseContributors) {
		return horseContributors.map(horseContributor => {
			return this.show(horseContributor)
		})
	}

	show(horseContributor) {
		return {
			id: horseContributor.id,
			firstName: horseContributor.firstName,
			lastName: horseContributor.lastName,
			email: horseContributor.email,
			createdAt: horseContributor.createdAt,
			updatedAt: horseContributor.updatedAt,
		}
	}

	create(horseContributor) {
		return this.show(horseContributor)
	}

	update(horseContributor) {
		return this.show(horseContributor)
	}
}
