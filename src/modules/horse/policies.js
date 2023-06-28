import createError from 'http-errors'
import i18next from '../../../i18n'

export class HorsePolicy {
	async index(request, horses) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return horses
			case 'EMPLOYEE':
				return horses
			case 'CLIENT':
				return horses.filter(horse => horse.ownerId === request.user.id)
		}
	}

	async show(request, horse) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return horse
			case 'EMPLOYEE':
				return horse
			case 'CLIENT':
				if (request.user.id !== horse.ownerId) {
					throw createError(401, i18next.t('horse_unauthorized'))
				}
				return horse
		}
	}

	async delete(request, horse) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return horse
			case 'EMPLOYEE':
				return horse
			case 'CLIENT':
				if (request.user.id !== horse.ownerId) {
					throw createError(401, i18next.t('horse_unauthorized'))
				}
				return horse
		}
	}

	async create(request, data) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return data
			case 'EMPLOYEE':
				return data
			case 'CLIENT':
				if (data.ownerId !== request.user.id) {
					throw createError(401, i18next.t('horse_unauthorized'))
				}
				return data
		}
	}

	async update(request, horse, data) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return horse
			case 'EMPLOYEE':
				return horse
			case 'CLIENT':
				if (horse.ownerId !== request.user.id) {
					throw createError(401, i18next.t('horse_unauthorized'))
				}
				if (horse.ownerId !== data.ownerId) {
					throw createError(401, i18next.t('horse_unauthorized_change_ownerId'))
				}
				return horse
		}
	}
}
