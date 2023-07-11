import { Op } from 'sequelize'
import createError from 'http-errors'
import { BaseService } from '@/core/BaseService'
import { Competition } from '@/modules/competition/model'
import db from '@/database'

export class CompetitionService extends BaseService {
	constructor() {
		super(Competition.getModelName(), 'competition_404')
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
			throw createError('competition_422_inexistingParticipant')
		}
		const transaction = await db.transaction()
		try {
			let competition = await super.create(data)
			await competition.setParticipants(participants)
			competition = await this.findOrFail(competition.id, options)
			await transaction.commit()
			return competition
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}
}
