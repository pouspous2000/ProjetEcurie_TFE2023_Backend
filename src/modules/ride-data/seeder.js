import { Op } from 'sequelize'
import { Horse } from '@/modules/horse/model'
import { RideData } from '@/modules/ride-data/model'
import { Ride } from '@/modules/ride/model'
import { ArrayUtils } from '@/utils/ArrayUtils'

export const upRideData = async queryInterface => {
	const horses = await queryInterface.rawSelect(
		Horse.getTable(),
		{
			where: { id: { [Op.ne]: 0 } },
			plain: false,
		},
		['id']
	)

	const rides = await queryInterface.rawSelect(
		Ride.getTable(),
		{
			where: { id: { [Op.ne]: 0 } },
			plain: false,
		},
		['id']
	)

	const rideDataObjs = horses.map(horse => {
		const ride = ArrayUtils.getRandomElement(rides)
		if (ride.period === 'DAY') {
			return null
		}
		return {
			horseId: horse.id,
			rideId: ride.id,
			name: ride.name,
			period: ride.period,
			price: ride.price,
			createdAt: new Date(),
			deletedAt: null,
		}
	})
	await queryInterface.bulkInsert(
		RideData.getTable(),
		rideDataObjs.filter(rideDataObj => rideDataObj !== null)
	)
}

export const downRideData = async queryInterface => {
	await queryInterface.bulkDelete(RideData.getTable(), null, {})
}
