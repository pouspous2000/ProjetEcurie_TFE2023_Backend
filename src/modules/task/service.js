import { BaseService } from '@/core/BaseService'
import { Task } from '@/modules/task/model'

export class TaskService extends BaseService {
	constructor() {
		super(Task.getModelName(), 'task_404')
	}

	async create(data) {
		return await super.create({ ...data, status: 'PENDING' })
	}
}
