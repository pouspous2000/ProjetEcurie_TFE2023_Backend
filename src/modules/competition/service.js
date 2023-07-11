import { Op } from 'sequelize'
import createError from 'http-errors'
import { BaseService } from '@/core/BaseService'
import { Competition } from '@/modules/competition/model'
import db from '@/database'
import i18next from '../../../i18n'

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

	async subscribe(competition, userId) {
		if (competition.creatorId === userId) {
			throw createError(422, i18next.t('competition_422_creatorSubscription'))
		}

		if (new Date() > competition.endingAt) {
			throw createError(422, i18next.t('competition_422_subscriptionOnPastCompetition'))
		}

		if (!(await competition.hasParticipant(userId))) {
			await competition.addParticipant(userId)
		} else {
			await competition.removeParticipant(userId)
		}
	}
}
