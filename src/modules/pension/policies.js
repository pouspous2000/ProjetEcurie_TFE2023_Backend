import createError from 'http-errors'
import { PensionService } from '@/modules/pension/service'
import i18next from '../../../i18n'

export class PensionPolicy {
	constructor() {
		this._pensionService = new PensionService()
	}

	async index(request, pensions) {
		return pensions
	}

	async show(request, pension) {
		return pension
	}

	async delete(request) {
		if (request.user.roleCategory === 'ADMIN') {
			return
		}
		throw createError(401, i18next.t('pension_unauthorized'))
	}

	async create(request) {
		if (request.user.roleCategory === 'ADMIN') {
			return
		}
		throw createError(401, i18next.t('pension_unauthorized'))
	}

	async update(request) {
		if (request.user.roleCategory === 'ADMIN') {
			return
		}
		throw createError(401, i18next.t('pension_unauthorized'))
	}
}
