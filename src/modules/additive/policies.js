import createError from 'http-errors'
import i18next from '../../../i18n'

export class AdditivePolicy {
	constructor() {}

	async index(request, additives) {
		return additives
	}

	async show(request, additive) {
		return additive
	}

	async delete(request, additive) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return additive
			case 'EMPLOYEE':
				throw createError(401, i18next.t('additive_unauthorized'))
			case 'CLIENT':
				throw createError(401, i18next.t('additive_unauthorized'))
		}
	}

	async create(request, data) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return data
			case 'EMPLOYEE':
				throw createError(401, i18next.t('additive_unauthorized'))
			case 'CLIENT':
				throw createError(401, i18next.t('additive_unauthorized'))
		}
	}

	async update(request, additive) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return additive
			case 'EMPLOYEE':
				throw createError(401, i18next.t('additive_unauthorized'))
			case 'CLIENT':
				throw createError(401, i18next.t('additive_unauthorized'))
		}
	}
}
