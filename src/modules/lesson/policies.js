import createError from 'http-errors'
import i18next from '../../../i18n'

export class LessonPolicy {
	async index(request, lessons) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return lessons
			case 'EMPLOYEE':
				return lessons.filter(lesson => lesson.creatorId === request.user.id)
			case 'CLIENT':
				return lessons.filter(lesson => lesson.clientId === request.user.id)
		}
	}

	async show(request, lesson) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return lesson
			case 'EMPLOYEE':
				if (lesson.creatorId !== request.user.id) {
					throw createError(401, i18next.t('lesson_unauthorized'))
				}
				return lesson
			case 'CLIENT':
				if (lesson.clientId !== request.user.id) {
					throw createError(401, i18next.t('lesson_unauthorized'))
				}
				return lesson
		}
	}

	async delete(request, lesson) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return lesson
			default:
				throw createError(401, i18next.t('lesson_unauthorized'))
		}
	}
}
