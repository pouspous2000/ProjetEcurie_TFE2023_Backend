import createError from 'http-errors'
import i18next from '../../../i18n'

export class DailyRidePolicy {
	constructor() {}

	async index(request, dailyRides) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return dailyRides
			case 'EMPLOYEE':
				return dailyRides
			case 'CLIENT':
				return dailyRides.filter(dailyRide => dailyRide.horse.ownerId === request.user.id)
		}
	}

	async show(request, dailyRide) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return dailyRide
			case 'EMPLOYEE':
				return dailyRide
			case 'CLIENT':
				if (dailyRide.horse.ownerId !== request.user.id) {
					throw createError(401, i18next.t('dailyRide_unauthorized'))
				}
		}
	}
}
