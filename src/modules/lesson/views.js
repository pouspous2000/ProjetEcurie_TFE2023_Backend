export class LessonView {
	constructor() {}

	index(lessons) {
		return lessons.map(lesson => {
			return this.show(lesson)
		})
	}

	show(lesson) {
		return {
			id: lesson.id,
			creator: {
				userId: lesson.creator.contact.userId,
				firstName: lesson.creator.contact.firstName,
				lastName: lesson.creator.contact.lastName,
				phone: lesson.creator.contact.phone,
				mobile: lesson.creator.contact.mobile,
			},
			client: {
				userId: lesson.client.contact.userId,
				firstName: lesson.client.contact.firstName,
				lastName: lesson.client.contact.lastName,
				phone: lesson.client.contact.phone,
				mobile: lesson.client.contact.mobile,
			},
			startingAt: lesson.startingAt,
			endingAt: lesson.endingAt,
			status: lesson.status,
			createdAt: lesson.startingAt,
			updatedAt: lesson.endingAt,
		}
	}
}
