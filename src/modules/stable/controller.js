import { BaseController } from '@/core/BaseController'
import { StableService } from '@/modules/stable/service'

export class StableController extends BaseController {
	constructor() {
		super(new StableService())
		this.show = this.show.bind(this)
		this.update = this.update.bind(this)
	}
}
