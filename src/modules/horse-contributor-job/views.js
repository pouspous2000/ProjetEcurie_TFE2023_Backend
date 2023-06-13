export class HorseContributorJobView {
	static index(records) {
		return records.map(record => {
			const value = record.dataValues
			return {
				id: value.id,
				name: value.name,
			}
		})
	}
}
