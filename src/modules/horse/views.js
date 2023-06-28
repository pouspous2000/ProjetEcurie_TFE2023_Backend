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
			ownerId: horse.ownerId,
			pensionId: horse.pensionId,
			comment: horse.comment,
			createdAt: horse.createdAt,
			updatedAt: horse.updatedAt,
		}
	}

	create(horse) {
		return this.show(horse)
	}

	update(horse) {
		return this.show(horse)
	}
}
