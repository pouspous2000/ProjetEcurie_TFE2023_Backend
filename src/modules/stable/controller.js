import { BaseController } from '@/core/BaseController'
import { StableService } from '@/modules/stable/service'
import { StableView } from '@/modules/stable/views'

export class StableController extends BaseController {
	constructor() {
		super(new StableService(), undefined, new StableView())
		this.show = this.show.bind(this)
		this.update = this.update.bind(this)
	}
}
