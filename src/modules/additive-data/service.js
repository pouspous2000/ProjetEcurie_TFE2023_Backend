import { Op } from 'sequelize'
import createError from 'http-errors'
import { HorseService } from '@/modules/horse/service'
import db from '@/database'
import i18next from '../../../i18n'

export class AdditiveDataService {
	constructor() {
		this._horseService = new HorseService()
	}

	async add(horseId, additiveIds, options) {
		const horse = await db.models.Horse.findByPk(horseId)
		if (!horse) {
			throw createError(422, i18next.t('additiveData_422_inexistingHorse'))
		}

		const additives = await db.models.Additive.findAll({
			where: {
				id: {
					[Op.in]: additiveIds,
				},
			},
		})

		if (additives.length !== additiveIds.length) {
			throw createError(422, i18next.t('additiveData_422_inexistingAdditive'))
		}

		await db.models.AdditiveData.bulkCreate(
			additives.map(additive => ({
				additiveId: additive.id,
				horseId: horseId,
				name: additive.name,
				price: additive.price,
				status: 'ACTIVE',
			}))
		)

		return await this._horseService.findOrFail(horseId, options)
	}

	async cancel(horseId, additiveDataIds, options) {
		const horse = await db.models.Horse.findByPk(horseId)
		if (!horse) {
			throw createError(422, i18next.t('additiveData_422_inexistingHorse'))
		}

		const additiveDatas = await db.models.AdditiveData.findAll({
			where: {
				[Op.and]: [
					{
						id: { [Op.in]: additiveDataIds },
					},
					{
						horseId: horseId,
					},
				],
			},
		})

		if (additiveDatas.length !== additiveDataIds.length) {
			throw createError(422, i18next.t('additiveData_422_404'))
		}

		if (!additiveDatas.every(additiveData => additiveData.status === 'ACTIVE')) {
			throw createError(422, i18next.t('additiveData_422_status'))
		}

		await db.models.AdditiveData.update(
			{ status: 'CANCELLED' },
			{
				where: {
					id: {
						[Op.in]: additiveDataIds,
					},
				},
			}
		)

		return await this._horseService.findOrFail(horseId, options)
	}

	async markAsInvoiced(additiveDatas) {
		if (!additiveDatas.every(additiveData => additiveData.status === 'ACTIVE')) {
			throw createError(422, i18next.t('additiveData_422_status'))
		}

		return await db.models.AdditiveData.update(
			{ status: 'INVOICED' },
			{
				where: {
					id: {
						[Op.in]: additiveDatas.map(additiveData => additiveData.id),
					},
				},
			}
		)
	}
}
