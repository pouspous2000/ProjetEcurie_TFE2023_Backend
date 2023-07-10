import { Op } from 'sequelize'
import createError from 'http-errors'
import { BaseService } from '@/core/BaseService'
import { Event } from '@/modules/event/model'
import db from '@/database'
import i18next from 'i18next'

export class EventService extends BaseService {
	constructor() {
		super(Event.getModelName(), 'event_404')
	}

	async create(data, options = {}) {
		const participants = await db.models.User.findAll({
			where: {
				id: {
					[Op.in]: data.participants,
				},
			},
		})
		if (participants.length !== data.participants.length) {
			throw createError('event_422_inexistingParticipant')
		}
		const transaction = await db.transaction()
		try {
			let event = await super.create(data)
			await event.setParticipants(participants)
			event = await this.findOrFail(event.id, options)
			await transaction.commit()
			return event
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}

	async subscribe(event, userId) {
		if (event.creatorId === userId) {
			throw createError(422, i18next.t('event_422_creatorSubscription'))
		}

		if (new Date() > event.endingAt) {
			throw createError(422, i18next.t('event_422_subscriptionOnPastEvent'))
		}

		if (!(await event.hasParticipant(userId))) {
			await event.addParticipant(userId)
		} else {
			await event.removeParticipant(userId)
		}
	}
}
