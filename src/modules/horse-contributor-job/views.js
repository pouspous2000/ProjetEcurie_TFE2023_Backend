export class HorseContributorJobView {
	constructor() {}

	index(horseContributorJobs) {
		return horseContributorJobs.map(record => {
			const value = record.dataValues
			return {
				id: value.id,
				name: value.name,
			}
		})
	}
}
