import db from '@/database'
import { BaseService } from '@/core/BaseService'
import { Ride } from '@/modules/ride/model'
import { RideDataService } from '@/modules/ride-data/service'

export class RideService extends BaseService {
	constructor() {
		super(Ride.getModelName(), 'ride_404')
		this._rideDataService = new RideDataService()
	}

	async update(instance, data) {
		const transaction = await db.transaction()
		try {
			const ride = await super.update(instance, data)
			await this._rideDataService.updateRideDataAfterRideUpdate(ride)
			await transaction.commit()
			return ride
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}

	async delete(instance) {
		const transaction = await db.transaction()
		try {
			await this._rideDataService.updateRideDataAfterRideDelete(instance)
			const ride = await super.delete(instance)
			await transaction.commit()
			return ride
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}
}
