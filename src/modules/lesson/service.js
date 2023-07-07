import db from '@/database'
import { BaseService } from '@/core/BaseService'
import { Lesson } from '@/modules/lesson/model'
import createError from 'http-errors'
import i18next from '../../../i18n'

export class LessonService extends BaseService {
	constructor() {
		super(Lesson.getModelName(), 'lesson_404')
	}

	async create(data) {
		const client = await db.models.User.findByPk(data.clientId)
		if (!client) {
			throw createError(422, i18next.t('lesson_422_inexisting_client'))
		}
		return await super.create({ ...data, status: 'CONFIRMED' })
	}
}
