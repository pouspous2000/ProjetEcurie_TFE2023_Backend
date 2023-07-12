import { BaseController } from '@/core/BaseController'
import { RideService } from '@/modules/ride/service'
import { RidePolicy } from '@/modules/ride/policies'
import { RideView } from '@/modules/ride/views'

export class RideController extends BaseController {
	constructor() {
		super(new RideService(), new RidePolicy(), new RideView())
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
	}
}
