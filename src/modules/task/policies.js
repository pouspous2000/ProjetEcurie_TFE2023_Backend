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
				// an admin can only cancel a task
				if (task.status !== data.status && data.status !== 'CANCELLED') {
					throw createError(401, i18next.t('task_401_update_admin_status'))
				}
				// cannot update a task if confirmed or in progress or blocked
				if (['CONFIRMED', 'IN PROGRESS', 'BLOCKED'].includes(task.status)) {
					const fields = [
						'creatorId',
						'employeeId',
						'name',
						'description',
						'startingAt',
						'endingAt',
						'remark',
					]
					for (const field of fields) {
						if (task[field] !== data[field]) {
							throw createError(401, i18next.t('task_401_update_admin_field_when_status'))
						}
					}
				}
				return task
			case 'EMPLOYEE':
				if (task.employeeId !== request.user.id) {
					throw createError(401, i18next.t('task_unauthorized'))
				}
				for (const key of Object.keys(data)) {
					// if status is about to change
					if (key === 'status' && task.status !== data.status) {
						// kind of state machine ...
						if (task.status === 'PENDING' && data.status !== 'CONFIRMED') {
							throw createError(422, i18next.t('task_422_update_employee_fromPending_toConfirmed'))
						}
						if (task.status === 'CONFIRMED' && !['IN PROGRESS', 'BLOCKED'].includes(data.status)) {
							throw createError(
								422,
								i18next.t('task_422_update_employee_fromConfirmed_toInProgressOrBlocked')
							)
						}
						if (task.status === 'IN PROGRESS' && !['COMPLETED', 'BLOCKED'].includes(data.status)) {
							throw createError(
								422,
								i18next.t('task_422_update_employee_fromInProgress_toCompletedOrBlocked')
							)
						}
						if (task.status === 'BLOCKED' && data.status !== 'IN PROGRESS') {
							throw createError(422, i18next.t('task_422_update_employee_fromBlocked_toInProgress'))
						}
					}
					if (!['remark', 'status'].includes(key) && task[key] !== data[key]) {
						if (
							['startingAt', 'endingAt', 'createdAt', 'updatedAt'].includes(key) &&
							new Date(task[key]).getTime() === new Date(data[key]).getTime()
						) {
							continue
						}
						throw createError(401, i18next.t('task_unauthorized_employee_updateField'))
					}
				}
				return task
			case 'CLIENT':
				throw createError(401, i18next.t('task_unauthorized'))
		}
	}
}
