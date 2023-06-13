import createError from 'http-errors'
import db from '@/database'

export class HorseContributorJobService {
	static async index() {
		return await db.models.HorseContributorJob.findAll()
	}

	static async single(id) {
		return await db.models.HorseContributorJob.findByPk(id)
	}

	static async findOrFail(id) {
		const horseContributorJob = await db.models.HorseContributorJob.findByPk(id)
		if (!horseContributorJob) {
			throw createError(404, `no horseContributorJob with id ${id}`)
		}
		return horseContributorJob
	}
}
