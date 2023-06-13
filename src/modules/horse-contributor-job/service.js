import createError from 'http-errors'
import db from '@/database'
import i18next from '../../../i18n'

export class HorseContributorJobService {
	static async index() {
		return await db.models.HorseContributorJob.findAll()
	}

	static async single(id) {
		return await db.models.HorseContributorJob.findByPk(id)
	}

	static async delete(horseContributorJobInstance) {
		await horseContributorJobInstance.destroy()
	}

	static async findOrFail(id) {
		const horseContributorJob = await db.models.HorseContributorJob.findByPk(id)
		if (!horseContributorJob) {
			throw createError(404, i18next.t('horseContributorJob_404'))
		}
		return horseContributorJob
	}
}
