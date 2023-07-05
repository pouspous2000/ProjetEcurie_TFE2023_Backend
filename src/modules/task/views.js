export class TaskView {
	constructor() {}

	index(tasks) {
		return tasks.map(task => {
			return this.show(task)
		})
	}

	show(task) {
		return {
			id: task.id,
			creator: {
				userId: task.creator.contact.userId,
				firstName: task.creator.contact.firstName,
				lastName: task.creator.contact.lastName,
				phone: task.creator.contact.phone,
				mobile: task.creator.contact.mobile,
			},
			employee: {
				userId: task.employee.contact.userId,
				firstName: task.employee.contact.firstName,
				lastName: task.employee.contact.lastName,
				phone: task.employee.contact.phone,
				mobile: task.employee.contact.mobile,
			},
			name: task.name,
			startingAt: task.startingAt,
			endingAt: task.endingAt,
			remark: task.remark,
			status: task.status,
			createdAt: task.createdAt,
			updatedAt: task.updatedAt,
		}
	}

	create(task) {
		return this.show(task)
	}

	update(task) {
		return this.show(task)
	}
}
