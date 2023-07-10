import { BaseFactory } from '@/core/BaseFactory'

export class CompetitionFactory extends BaseFactory {
	static competitionNb = 1

	static create(creatorId) {
		const durationInMinutes = Math.floor(Math.random() * (120 - 10 + 1) + 10)
		const todayTs = new Date().getTime()
		const fiveDaysInMs = 5 * 24 * 3600 * 1000
		const fiveDaysTs = todayTs + fiveDaysInMs
		const dataStartingAt = new Date(Math.floor(Math.random() * (fiveDaysTs - todayTs + 1)) + todayTs)
		const dataEndingAt = new Date(dataStartingAt.getTime() + durationInMinutes * 60 * 1000) // duration in min ... in ms

		const data = {
			creatorId,
			name: `COMPETITION_${this.competitionNb}`,
			description: `COMPETITION_DESCRIPTION_${this.competitionNb}`,
			startingAt: dataStartingAt,
			endingAt: dataEndingAt,
			...this._create(),
		}

		this.competitionNb++
		return data
	}
}
