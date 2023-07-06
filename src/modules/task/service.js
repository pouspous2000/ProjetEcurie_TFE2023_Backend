import { BaseService } from '@/core/BaseService'
import { Task } from '@/modules/task/model'
import createError from 'http-errors'
import i18next from '../../../i18n'

export class TaskService extends BaseService {
	constructor() {
		super(Task.getModelName(), 'task_404')
	}

	async create(data) {
		return await super.create({ ...data, status: 'PENDING' })
	}

	async update(instance, data) {
		if (['COMPLETED', 'CANCELLED'].includes(instance.status)) {
			// this code should not be called thx to policies
			throw createError(422, i18next.t('task_422_update_completedOrCancelled'))
		}
		return await super.update(instance, data)
	}
}
