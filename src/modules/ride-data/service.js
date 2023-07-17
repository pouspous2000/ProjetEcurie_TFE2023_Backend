import { Op } from 'sequelize'
import createError from 'http-errors'
import db from '@/database'
import i18next from '../../../i18n'

export class RideDataService {
	constructor() {}

	async add(horse, ride) {
		return await db.models.RideData.create({
			horseId: horse.id,
			rideId: ride.id,
			name: ride.name,
			period: ride.period,
			price: ride.price,
		})
	}

	async update(horse, ride) {
		let doesRequireRideDataUpdate = false
		let rideDatas = []
		if (ride) {
			rideDatas = await db.models.RideData.findAll({
				where: {
					[Op.and]: [{ horseId: horse.id }, { rideId: horse.rideId }, { deletedAt: null }],
				},
				paranoid: false,
			})
		}
		if (rideDatas.length > 1) {
			throw createError(422, i18next.t('rideData_422_multipleNotDeletedRideData'))
		}
		if (rideDatas.length === 1) {
			const fieldsToCompare = ['name', 'period', 'price']
			for (let field of fieldsToCompare) {
				if (rideDatas[0][field] !== ride[field]) {
					doesRequireRideDataUpdate = true
				}
			}
		}

		if (doesRequireRideDataUpdate || horse.rideId !== ride.id) {
			if (rideDatas.length) {
				await rideDatas[0].update({ deletedAt: new Date() })
			}

			await db.models.RideData.create({
				horseId: horse.id,
				rideId: ride.id,
				name: ride.name,
				period: ride.period,
				price: ride.price,
				createdAt: new Date(),
				deletedAt: null,
			})
		}
	}

	async updateRideDataAfterRideUpdate(ride) {
		const rideDatas = await db.models.RideData.findAll({
			where: {
				[Op.and]: [{ rideId: ride.id }, { deletedAt: null }],
			},
		})

		await db.models.RideData.update(
			{ deletedAt: new Date() },
			{
				where: {
					id: {
						[Op.in]: rideDatas.map(rideData => rideData.id),
					},
				},
			}
		)

		const updatedRideDatas = rideDatas.map(rideData => {
			return {
				horseId: rideData.horseId,
				rideId: ride.id,
				name: ride.name,
				period: ride.period,
				price: ride.price,
				createdAt: new Date(),
				deletedAt: null,
			}
		})

		await db.models.RideData.bulkCreate(updatedRideDatas)
	}

	async updateRideDataAfterRideDelete(ride) {
		const rideDatas = await db.models.RideData.findAll({
			where: {
				[Op.and]: [{ rideId: ride.id }, { deletedAt: null }],
			},
		})

		await db.models.RideData.update(
			{ deletedAt: new Date() },
			{
				where: {
					id: {
						[Op.in]: rideDatas.map(rideData => rideData.id),
					},
				},
			}
		)
	}
}
