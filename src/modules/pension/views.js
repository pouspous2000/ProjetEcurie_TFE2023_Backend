export class PensionView {
	constructor() {}

	index(pensions) {
		return pensions.map(pension => {
			return this.show(pension)
		})
	}

	show(pension) {
		return {
			id: pension.id,
			name: pension.name,
			monthlyPrice: pension.monthlyPrice,
			description: pension.description,
			createdAt: pension.createdAt,
			updatedAt: pension.updatedAt,
		}
	}
}
