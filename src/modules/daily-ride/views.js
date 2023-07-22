export class DailyRideView {
	constructor() {}

	index(dailyRides) {
		return dailyRides.map(dailyRide => {
			return this.show(dailyRide)
		})
	}

	show(dailyRide) {
		return {
			id: dailyRide.id,
			name: dailyRide.name,
			period: dailyRide.period,
			price: dailyRide.price,
			horse: {
				id: dailyRide.horse.id,
				ownerId: dailyRide.horse.ownerId,
				pensionId: dailyRide.horse.pensionId,
				name: dailyRide.horse.name,
				comment: dailyRide.horse.comment,
			},
			task: {
				id: dailyRide.task.id,
				name: dailyRide.task.name,
				description: dailyRide.task.description,
				startingAt: dailyRide.task.startingAt,
				endingAt: dailyRide.task.endingAt,
				remark: dailyRide.task.remark,
				status: dailyRide.task.status,
			},
			createdAt: dailyRide.createdAt,
			deletedAt: dailyRide.deletedAt,
		}
	}

	create(dailyRide) {
		return this.show(dailyRide)
	}

	update(dailyRide) {
		return this.show(dailyRide)
	}
}
