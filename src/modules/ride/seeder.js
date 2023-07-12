import { Ride } from '@/modules/ride/model'
import { RideFactory } from '@/modules/ride/factory'

export const upRide = async queryInterface => {
	await queryInterface.bulkInsert(Ride.getTable(), RideFactory.createAll())
}

export const downRide = async queryInterface => {
	await queryInterface.bulkDelete(Ride.getTable(), null, {})
}
