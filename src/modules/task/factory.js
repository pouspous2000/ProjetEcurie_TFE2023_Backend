import { BaseFactory } from '@/core/BaseFactory'
import { ArrayUtils } from '@/utils/ArrayUtils'

export class TaskFactory extends BaseFactory {
	static todoNb = 1

	static create(creatorId, employeeId, status = undefined) {
		const dataStatus = status
			? status
			: ArrayUtils.getRandomElement(['PENDING', 'CONFIRMED', 'IN PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED'])
		const dataRemark = dataStatus === 'BLOCKED' ? `REMARK_${this.todoNb}` : null
		const durationInMinutes = Math.floor(Math.random() * (120 - 10 + 1) + 10)

		const todayTs = new Date().getTime()
		const fiveDaysInMs = 5 * 24 * 3600 * 1000
		const fiveDaysTs = todayTs + fiveDaysInMs
		const dataStartingAt = new Date(Math.floor(Math.random() * (fiveDaysTs - todayTs + 1)) + todayTs)
		const dataEndingAt = new Date(dataStartingAt.getTime() + durationInMinutes * 60 * 1000) // duration in min ... in ms

		const data = {
			creatorId,
			employeeId,
			name: `TODO_${this.todoNb}`,
			description: `DESCRIPTION_${this.todoNb}`,
			status: dataStatus,
			remark: dataRemark,
			startingAt: dataStartingAt,
			endingAt: dataEndingAt,
			...this._create(),
		}

		this.todoNb++
		return data
	}
}
