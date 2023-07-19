import { BaseService } from '@/core/BaseService'
import { DailyRide } from '@/modules/daily-ride/model'

export class DailyRideService extends BaseService {
	constructor() {
		super(DailyRide.getModelName(), 'dailyRide_404')
	}
}
