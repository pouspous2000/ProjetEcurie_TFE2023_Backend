import createError from 'http-errors'
import i18next from '../../../i18n'

export class HorseContributorPolicy {
	async index(request, horseContributorJobs) {
		return horseContributorJobs
	}

	async show(request, horseContributorJob) {
		return horseContributorJob
	}

	async delete(request, horseContributorJob) {
		// when horse relation is implemented => add permissions to clients
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return horseContributorJob
			case 'EMPLOYEE':
				return horseContributorJob
			case 'CLIENT':
				throw createError(401, i18next.t('horseContributor_401'))
		}
	}

	async create(request, data) {
		return data
	}

	async update(request, horseContributorJob) {
		// when horse relation is implemented => add permissions to clients
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return horseContributorJob
			case 'EMPLOYEE':
				return horseContributorJob
			case 'CLIENT':
				throw createError(401, i18next.t('horseContributor_401'))
		}
	}
}
