import createError from 'http-errors'
import { HorseService } from '@/modules/horse/service'
import i18next from '../../../i18n'

export class DailyRidePolicy {
	constructor() {
		this._horseService = new HorseService()
	}

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
				return dailyRide
		}
	}

	async delete(request, dailyRide) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return dailyRide
			case 'EMPLOYEE':
				return dailyRide
			case 'CLIENT':
				if (dailyRide.horse.ownerId !== request.user.id) {
					throw createError(401, i18next.t('dailyRide_unauthorized'))
				}
				return dailyRide
		}
	}

	async create(request, data) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return data
			case 'EMPLOYEE':
				return data
			case 'CLIENT':
				// eslint-disable-next-line no-case-declarations
				const horse = await this._horseService.findOrFail(data.horseId)
				if (horse.ownerId !== request.user.id) {
					throw createError(401, i18next.t('dailyRide_unauthorized'))
				}
				return data
		}
	}

	async update(request, dailyRide) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return dailyRide
			case 'EMPLOYEE':
				return dailyRide
			case 'CLIENT':
				// eslint-disable-next-line no-case-declarations
				if (dailyRide.horse.ownerId !== request.user.id) {
					throw createError(401, i18next.t('dailyRide_unauthorized'))
				}
				return dailyRide
		}
	}
}
