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

	async update(instance, data) {
		const client = await db.models.User.findByPk(instance.clientId)
		if (!client) {
			throw createError(422, i18next.t('lesson_422_inexisting_client'))
		}
		const creator = await db.models.User.findByPk(instance.creatorId)
		if (!creator) {
			throw createError(422, i18next.t('lesson_422_inexisting_creator'))
		}

		if (['DONE', 'CANCELLED', 'ABSENCE'].includes(instance.status)) {
			throw createError(422, i18next.t('lesson_422_update_completed'))
		}

		if (data.creatorId && data.creatorId !== instance.creatorId) {
			throw createError(422, i18next.t('lesson_422_creatorId_change'))
		}

		if (data.clientId && data.clientId !== instance.clientId) {
			throw createError(422, i18next.t('lesson_422_clientId_change'))
		}

		return await super.update(instance, data)
	}
}
