import { BaseService } from '@/core/BaseService'
import { Ride } from '@/modules/ride/model'

export class RideService extends BaseService {
	constructor() {
		super(Ride.getModelName(), 'ride_404')
	}
}
