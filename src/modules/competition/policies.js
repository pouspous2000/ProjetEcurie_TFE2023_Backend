import createError from 'http-errors'
import i18next from '../../../i18n'

export class CompetitionPolicy {
	async index(request, competitions) {
		return competitions
	}

	async show(request, competition) {
		return competition
	}

	async delete(request, competition) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return competition
			case 'EMPLOYEE':
				if (request.user.id !== competition.creatorId) {
					throw createError(401, i18next.t('competition_unauthorized'))
				}
				return competition
			case 'CLIENT':
				// this should not be called as it is prevented by the role middleware
				throw createError(401, i18next.t('competition_unauthorized'))
		}
	}

	async create(request, data) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return data
			case 'EMPLOYEE':
				if (data.creatorId !== request.user.id) {
					throw createError(401, i18next.t('competition_unauthorized'))
				}
				return data
			case 'CLIENT':
				// this should not be called (role middleware)
				throw createError(401, i18next.t('competition_unauthorized'))
		}
	}
}
