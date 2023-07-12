import { Op } from 'sequelize'
import { Horse } from '@/modules/horse/model'
import { HorseRide } from '@/modules/ride-data/model'
import { Ride } from '@/modules/ride/model'
import { ArrayUtils } from '@/utils/ArrayUtils'

export const upHorseRide = async queryInterface => {
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

	const horseRideObjs = horses.map(horse => {
		const ride = ArrayUtils.getRandomElement(rides)
		const durationInMinutes = Math.floor(Math.random() * (120 - 10 + 1) + 10)
		const todayTs = new Date().getTime()
		const fiveDaysInMs = 5 * 24 * 3600 * 1000
		const fiveDaysTs = todayTs + fiveDaysInMs
		const dataStartingAt = new Date(Math.floor(Math.random() * (fiveDaysTs - todayTs + 1)) + todayTs)
		const dataEndingAt = new Date(dataStartingAt.getTime() + durationInMinutes * 60 * 1000) // duration in min ... in ms

		return {
			horseId: horse.id,
			rideId: ride.id,
			name: ride.name,
			period: ride.period,
			price: ride.price,
			startingAt: ride.period === 'DAY' ? dataStartingAt : null,
			endingAt: ride.period === 'DAY' ? dataEndingAt : null,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		}
	})
	await queryInterface.bulkInsert(HorseRide.getTable(), horseRideObjs)
}

export const downHorseRide = async queryInterface => {
	await queryInterface.bulkDelete(HorseRide.getTable(), null, {})
}
