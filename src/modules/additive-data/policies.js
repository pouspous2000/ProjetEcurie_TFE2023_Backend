import createError from 'http-errors'
import i18next from '../../../i18n'

export class AdditiveDataPolicy {
	async add(request, horse) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return horse
			case 'EMPLOYEE':
				return horse
			case 'CLIENT':
				if (horse.ownerId !== request.user.id) {
					throw createError(401, i18next.t('additiveData_401'))
				}
				return horse
		}
	}

	async cancel(request, horse) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return horse
			case 'EMPLOYEE':
				return horse
			case 'CLIENT':
				if (horse.ownerId !== request.user.id) {
					throw createError(401, i18next.t('additiveData_401'))
				}
				return horse
		}
	}
}
