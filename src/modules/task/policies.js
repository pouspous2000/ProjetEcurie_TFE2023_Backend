import createError from 'http-errors'
import i18next from '../../../i18n'

export class TaskPolicy {
	async index(request, tasks) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return tasks
			case 'EMPLOYEE':
				return tasks.filter(task => task.employeeId === request.user.id)
			case 'CLIENT':
				throw createError(401, i18next.t('task_unauthorized'))
		}
	}

	async show(request, task) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return task
			case 'EMPLOYEE':
				if (task.employeeId !== request.user.id) {
					throw createError(401, i18next.t('task_unauthorized'))
				}
				return task
			case 'CLIENT':
				throw createError(401, i18next.t('task_unauthorized'))
		}
	}

	async delete(request, task) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return task
			default:
				throw createError(401, i18next.t('task_unauthorized'))
		}
	}

	async create(request, data) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return data
			default:
				throw createError(401, i18next.t('task_unauthorized'))
		}
	}

	async update(request, task, data) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				if (['COMPLETED', 'CANCELLED'].includes(task.status)) {
					throw createError('')
				}
				return task
			case 'EMPLOYEE':
				if (task.employeeId !== request.user.id) {
					throw createError(401, i18next.t('task_unauthorized'))
				}
				if (!['CONFIRMED', 'IN PROGRESS', 'COMPLETED', 'BLOCKED'].includes(data.status)) {
					throw createError(401, i18next.t('task_unauthorized_employee_updateStatus'))
				}
				for (const key of Object.keys(data)) {
					if (key !== 'remark' && task[key] !== data[key]) {
						throw createError(401, i18next.t('task_unauthorized_employee_updateField'))
					}
				}
				return task
			case 'CLIENT':
				throw createError(401, i18next.t('task_unauthorized'))
		}
	}
}
