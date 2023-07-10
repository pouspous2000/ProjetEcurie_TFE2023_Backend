import { Op } from 'sequelize'
import createError from 'http-errors'
import { BaseService } from '@/core/BaseService'
import { Event } from '@/modules/event/model'
import db from '@/database'

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
}
