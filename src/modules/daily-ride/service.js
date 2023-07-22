import createError from 'http-errors'
import { BaseService } from '@/core/BaseService'
import { DailyRide } from '@/modules/daily-ride/model'
import { TaskService } from '@/modules/task/service'
import db from '@/database'
import i18next from '../../../i18n'

export class DailyRideService extends BaseService {
	constructor() {
		super(DailyRide.getModelName(), 'dailyRide_404')
		this._taskService = new TaskService()
	}

	async delete(dailyRide) {
		if (['IN PROGRESS', 'COMPLETED', 'BLOCKED'].includes(dailyRide.task.status)) {
			throw createError(422, i18next.t('dailyRide_422_delete_when_status'))
		} else if (['PENDING', 'CONFIRMED'].includes(dailyRide.task.status)) {
			const transaction = await db.transaction()
			try {
				await this._taskService.update(dailyRide.task, { status: 'CANCELLED' })
				const response = await dailyRide.destroy()
				await transaction.commit()
				return response
			} catch (error) {
				await transaction.rollback()
				throw error
			}
		} else {
			return await dailyRide.destroy()
		}
	}
}
