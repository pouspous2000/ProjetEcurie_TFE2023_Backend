import createError from 'http-errors'
import i18next from '../../../i18n'

export class EventPolicy {
	async index(request, events) {
		return events
	}

	async show(request, event) {
		return event
	}

	async delete(request, event) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return event
			case 'EMPLOYEE':
				if (request.user.id !== event.creatorId) {
					throw createError(401, i18next.t('event_unauthorized'))
				}
				return event
			case 'CLIENT':
				// this should not be called as it is prevented by the role middleware
				throw createError(401, i18next.t('event_unauthorized'))
		}
	}

	async create(request, data) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return data
			case 'EMPLOYEE':
				if (data.creatorId !== request.user.id) {
					throw createError(401, i18next.t('event_unauthorized'))
				}
				return data
			case 'CLIENT':
				// this should not be called (role middleware)
				throw createError(401, i18next.t('event_unauthorized'))
		}
	}

	async update(request, event) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return event
			case 'EMPLOYEE':
				if (event.creatorId !== request.user.id) {
					throw createError(401, i18next.t('event_unauthorized'))
				}
				return event
			case 'CLIENT':
				// this should not be called (role middleware)
				throw createError(401, i18next.t('event_unauthorized'))
		}
	}
}
