import { BaseFactory } from '@/core/BaseFactory'

export class Eventfactory extends BaseFactory {
	static eventNb = 1

	static create(creatorId) {
		const durationInMinutes = Math.floor(Math.random() * (120 - 10 + 1) + 10)
		const todayTs = new Date().getTime()
		const fiveDaysInMs = 5 * 24 * 3600 * 1000
		const fiveDaysTs = todayTs + fiveDaysInMs
		const dataStartingAt = new Date(Math.floor(Math.random() * (fiveDaysTs - todayTs + 1)) + todayTs)
		const dataEndingAt = new Date(dataStartingAt.getTime() + durationInMinutes * 60 * 1000) // duration in min ... in ms

		const data = {
			creatorId,
			name: `EVENT_${this.eventNb}`,
			description: `DESCRIPTION_${this.eventNb}`,
			startingAt: dataStartingAt,
			endingAt: dataEndingAt,
			...this._create(),
		}

		this.eventNb++
		return data
	}
}
