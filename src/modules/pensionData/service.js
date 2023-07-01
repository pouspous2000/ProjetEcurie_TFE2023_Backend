import { Op } from 'sequelize'
import createError from 'http-errors'
import db from '@/database'
import i18next from '../../../i18n'

export class PensionDataService {
	constructor() {}

	async add(horse, pension) {
		return await db.models.PensionData.create({
			horseId: horse.id,
			pensionId: pension.id,
			name: pension.name,
			monthlyPrice: pension.monthlyPrice,
			description: pension.description,
		})
	}

	async update(horse, pension) {
		const pensionData = await this.comparePensionPensionData(horse, pension)
		if (horse.pensionId !== pension.id || pensionData !== true) {
			await pensionData.update({ deletedAt: new Date() })
			await db.models.PensionData.create({
				horseId: horse.id,
				pensionId: pension.id,
				name: pension.name,
				monthlyPrice: pension.monthlyPrice,
				description: pension.description,
				createdAt: new Date(),
				deletedAt: null,
			})
		}
	}

	async updatePensionDataAfterPensionUpdate(pension) {
		const pensionDatas = await db.models.PensionData.findAll({
			where: {
				[Op.and]: [{ pensionId: pension.id }, { deletedAt: null }],
			},
		})

		await db.models.PensionData.update(
			{ deletedAt: new Date() },
			{
				where: {
					id: {
						[Op.in]: pensionDatas.map(pensionData => pensionData.id),
					},
				},
			}
		)

		const updatedPensionDatas = pensionDatas.map(pensionData => {
			return {
				horseId: pensionData.horseId,
				pensionId: pensionData.pensionId,
				name: pension.name,
				monthlyPrice: pension.monthlyPrice,
				description: pension.description,
				createdAt: new Date(),
				deletedAt: null,
			}
		})

		await db.models.PensionData.bulkCreate(updatedPensionDatas)
	}

	async updatePensionDataAfterPensionDelete(pension) {
		const pensionDatas = await db.models.PensionData.findAll({
			where: {
				[Op.and]: [{ pensionId: pension.id }, { deletedAt: null }],
			},
		})

		await db.models.PensionData.update(
			{ deletedAt: new Date() },
			{
				where: {
					id: {
						[Op.in]: pensionDatas.map(pensionData => pensionData.id),
					},
				},
			}
		)
	}

	async comparePensionPensionData(horse, pension) {
		// getPension data, compare to current and returns false or pensionData (last), returns true if nothing changed else pensionData
		const pensionData = await db.models.PensionData.findAll({
			where: {
				[Op.and]: [{ horseId: horse.id }, { pensionId: horse.pensionId }, { deletedAt: null }],
			},
		})
		if (pensionData.length === 0) {
			throw createError(422, i18next.t('pensionData_404'))
		}
		if (pensionData.length > 1) {
			throw createError(422, i18next.t('pensionData_422_multipleNotDeletedPensionDatas'))
		}

		const fieldsToCompare = ['name', 'monthlyPrice', 'description']
		for (let field of fieldsToCompare) {
			if (pensionData[0][field] !== pension[field]) {
				return pensionData[0]
			}
		}
		return true
	}
}
