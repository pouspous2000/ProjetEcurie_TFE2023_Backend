import { BaseFactory } from '@/core/BaseFactory'
import { ArrayUtils } from '@/utils/ArrayUtils'

export class LessonFactory extends BaseFactory {
	static create(creatorId, clientId, status = undefined) {
		const dataStatus = status ? status : ArrayUtils.getRandomElement(['CONFIRMED', 'DONE', 'CANCELLED', 'ABSENCE'])

		const durationInMinutes = Math.floor(Math.random() * (120 - 10 + 1) + 10)
		const todayTs = new Date().getTime()
		const fiveDaysInMs = 5 * 24 * 3600 * 1000
		const fiveDaysTs = todayTs + fiveDaysInMs
		const dataStartingAt = new Date(Math.floor(Math.random() * (fiveDaysTs - todayTs + 1)) + todayTs)
		const dataEndingAt = new Date(dataStartingAt.getTime() + durationInMinutes * 60 * 1000) // duration in min ... in ms

		return {
			creatorId,
			clientId,
			startingAt: dataStartingAt,
			endingAt: dataEndingAt,
			status: dataStatus,
			...this._create(),
		}
	}
}
