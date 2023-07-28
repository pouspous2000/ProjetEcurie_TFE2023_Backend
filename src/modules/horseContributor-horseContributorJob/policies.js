import createError from 'http-errors'
import i18next from '../../../i18n'

export class HorseContributorHorseContributorJobPolicy {
	async addJobs(request, horse) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return horse
			case 'EMPLOYEE':
				return horse
			case 'CLIENT':
				if (horse.ownerId !== request.user.id) {
					throw createError(401, i18next.t('horseContributorHorseContributorJob_401'))
				}
				return horse
		}
	}

	async removeJobs(request, horse) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return horse
			case 'EMPLOYEE':
				return horse
			case 'CLIENT':
				if (horse.ownerId !== request.user.id) {
					throw createError(401, i18next.t('horseContributorHorseContributorJob_401'))
				}
				return horse
		}
	}
}
