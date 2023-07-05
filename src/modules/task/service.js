import { BaseService } from '@/core/BaseService'
import { Task } from '@/modules/task/model'

export class TaskService extends BaseService {
	constructor() {
		super(Task.getModelName(), 'task_404')
	}
}
