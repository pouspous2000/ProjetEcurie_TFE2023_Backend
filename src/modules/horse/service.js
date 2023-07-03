import { Op } from 'sequelize'
import db from '@/database'
import { Horse } from '@/modules/horse/model'
import { BaseService } from '@/core/BaseService'
import createError from 'http-errors'
import i18next from '../../../i18n'
import { PensionDataService } from '@/modules/pension-data/service'

export class HorseService extends BaseService {
	constructor() {
		super(Horse.getModelName(), 'horse_404')
		this._pensionDataService = new PensionDataService()
	}

	async create(data, options = {}) {
		const owner = await db.models.User.findByPk(data.ownerId)
		if (!owner) {
			throw createError(422, i18next.t('horse_422_inexistingOwner'))
		}
		const pension = await db.models.Pension.findByPk(data.pensionId)
		if (!pension) {
			throw createError(422, i18next.t('horse_422_inexistingPension'))
		}
		const horsemen = await db.models.User.findAll({
			where: {
				id: {
					[Op.in]: data.horsemen,
				},
			},
		})
		if (horsemen.length !== data.horsemen.length) {
			throw createError(422, i18next.t('horse_422_inexistingHorseman'))
		}

		const transaction = await db.transaction()
		try {
			let horse = await super.create(data)
			await horse.setHorsemen(horsemen)
			await this._pensionDataService.add(horse, pension)
			horse = await this.findOrFail(horse.id, options)
			await transaction.commit()
			return horse
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}

	async update(instance, data) {
		const owner = await db.models.User.findByPk(data.ownerId)
		if (!owner) {
			throw createError(422, i18next.t('horse_422_inexistingOwner'))
		}
		const pension = await db.models.Pension.findByPk(data.pensionId)
		if (!pension) {
			throw createError(422, i18next.t('horse_422_inexistingPension'))
		}
		const horsemen = await db.models.User.findAll({
			where: {
				id: {
					[Op.in]: data.horsemen,
				},
			},
		})
		if (horsemen.length !== data.horsemen.length) {
			throw createError(422, i18next.t('horse_422_inexistingHorseman'))
		}
		const transaction = await db.transaction()
		try {
			instance.setHorsemen(horsemen)
			this._pensionDataService.update(instance, pension)
			const horse = await super.update(instance, data)
			await transaction.commit()
			return horse
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}
}
