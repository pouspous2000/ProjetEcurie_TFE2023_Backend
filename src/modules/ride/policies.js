import createError from 'http-errors'
import i18next from '../../../i18n'

export class RidePolicy {
	constructor() {}

	async index(request, rides) {
		return rides
	}

	async show(request, ride) {
		return ride
	}

	async delete(request, ride) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return ride
			case 'EMPLOYEE':
				// this code should not be called - see middleware role
				throw createError(401, i18next.t('ride_unauthorized'))
			case 'CLIENT':
				// this code should not be called - see middleware role
				throw createError(401, i18next.t('ride_unauthorized'))
		}
	}

	async create(request, data) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return data
			case 'EMPLOYEE':
				// this code should not be called - see middleware role
				throw createError(401, i18next.t('ride_unauthorized'))
			case 'CLIENT':
				// this code should not be called - see middleware role
				throw createError(401, i18next.t('ride_unauthorized'))
		}
	}
}
