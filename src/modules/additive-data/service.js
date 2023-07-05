import db from '@/database'

export class AdditiveDataService {
	constructor() {}

	async add(horse, additives) {
		await db.models.AdditiveHorse.bulkCreate(
			additives.map(additive => ({
				additiveId: additive.id,
				horseId: horse.id,
				name: additive.name,
				price: additive.price,
			}))
		)
	}

	// eslint-disable-next-line no-unused-vars
	async update(horse, additives) {}
}
