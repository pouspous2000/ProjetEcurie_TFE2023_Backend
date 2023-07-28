import { Op } from 'sequelize'
import createError from 'http-errors'
import { HorseService } from '@/modules/horse/service'
import db from '@/database'
import i18next from '../../../i18n'

export class HorseContributorHorseContributorJobService {
	constructor() {
		this._horseService = new HorseService()
	}

	async addJobs(horseId, horseContributorId, horseContributorJobIds, options) {
		const horse = await db.models.Horse.findByPk(horseId)
		if (!horse) {
			throw createError(422, i18next.t('horseContributorHorseContributorJob_422_inexistingHorse'))
		}

		const horseContributor = await db.models.HorseContributor.findByPk(horseContributorId)
		if (!horseContributor) {
			throw createError(422, i18next.t('horseContributorHorseContributorJob_422_inexistingHorseContributor'))
		}

		const horseContributorJobs = await db.models.HorseContributorJob.findAll({
			where: {
				id: {
					[Op.in]: horseContributorJobIds,
				},
			},
		})
		if (horseContributorJobs.length !== horseContributorJobIds.length) {
			throw createError(422, i18next.t('horseContributorHorseContributorJob_422_inexistingHorseContributorJob'))
		}

		await db.models.HorseContributorHorseContributorJob.bulkCreate(
			horseContributorJobs.map(horseContributorJob => ({
				horseId: horse.id,
				horseContributorId: horseContributor.id,
				horseContributorJobId: horseContributorJob.id,
			}))
		)

		return await this._horseService.findOrFail(horseId, options)
	}

	async removeJobs(horseId, horseContributorHorseContributorJobIds, options) {
		const horse = await db.models.Horse.findByPk(horseId)
		if (!horse) {
			throw createError(422, i18next.t('horseContributorHorseContributorJob_422_inexistingHorse'))
		}

		const horseContributorHorseContributorJobs = await db.models.HorseContributorHorseContributorJob.findAll({
			where: {
				[Op.and]: [
					{
						id: {
							[Op.in]: horseContributorHorseContributorJobIds,
						},
					},
					{
						horseId: horseId,
					},
				],
			},
		})

		if (horseContributorHorseContributorJobs.length !== horseContributorHorseContributorJobIds.length) {
			throw createError(422, i18next.t('horseContributorHorseContributorJob_422_404'))
		}

		await db.models.HorseContributorHorseContributorJob.destroy({
			where: {
				id: {
					[Op.in]: horseContributorHorseContributorJobIds,
				},
			},
		})

		return await this._horseService.findOrFail(horseId, options)
	}
}
