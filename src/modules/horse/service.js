import { Op } from 'sequelize'
import createError from 'http-errors'
import db from '@/database'
import { Horse } from '@/modules/horse/model'
import { BaseService } from '@/core/BaseService'
import { PensionDataService } from '@/modules/pension-data/service'
import { AdditiveDataService } from '@/modules/additive-data/service'
import { RideDataService } from '@/modules/ride-data/service'
import i18next from '../../../i18n'

export class HorseService extends BaseService {
	constructor() {
		super(Horse.getModelName(), 'horse_404')
		this._pensionDataService = new PensionDataService()
		this._additiveDataService = new AdditiveDataService()
		this._rideDataService = new RideDataService()
	}

	async create(data, options = {}) {
		let ride = undefined

		const owner = await db.models.User.findByPk(data.ownerId)
		if (!owner) {
			throw createError(422, i18next.t('horse_422_inexistingOwner'))
		}

		const pension = await db.models.Pension.findByPk(data.pensionId)
		if (!pension) {
			throw createError(422, i18next.t('horse_422_inexistingPension'))
		}

		if (data.rideId) {
			ride = await db.models.Ride.findByPk(data.rideId)
			if (!ride) {
				throw createError(422, i18next.t('horse_422_inexistingRide'))
			}
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

		const additives = await db.models.Additive.findAll({
			where: {
				id: {
					[Op.in]: data.additives,
				},
			},
		})

		if (additives.length !== data.additives.length) {
			throw createError(422, i18next.t('horse_422_inexistingAdditives'))
		}

		const transaction = await db.transaction()
		try {
			let horse = await super.create(data)
			await horse.setHorsemen(horsemen)
			await this._pensionDataService.add(horse, pension)
			await this._additiveDataService.add(horse, additives)
			if (ride) {
				await this._rideDataService.add(horse, ride)
			}
			horse = await this.findOrFail(horse.id, options)
			await transaction.commit()
			return horse
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}

	async update(instance, data) {
		let ride = undefined

		const owner = await db.models.User.findByPk(data.ownerId)
		if (!owner) {
			throw createError(422, i18next.t('horse_422_inexistingOwner'))
		}
		const pension = await db.models.Pension.findByPk(data.pensionId)
		if (!pension) {
			throw createError(422, i18next.t('horse_422_inexistingPension'))
		}
		if (data.rideId) {
			ride = await db.models.Ride.findByPk(data.rideId)
			if (!ride) {
				throw createError(422, i18next.t('horse_422_inexistingRide'))
			}
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
		const additives = await db.models.Additive.findAll({
			where: {
				id: {
					[Op.in]: data.additives,
				},
			},
			paranoid: false,
		})

		if (additives.length !== data.additives.length) {
			throw createError(422, i18next.t('horse_422_inexistingAdditives'))
		}

		const transaction = await db.transaction()
		try {
			instance.setHorsemen(horsemen)
			this._pensionDataService.update(instance, pension)
			this._additiveDataService.update(instance, additives)
			this._rideDataService.update(instance, ride)
			const horse = await super.update(instance, data)
			await transaction.commit()
			return horse
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}
}
