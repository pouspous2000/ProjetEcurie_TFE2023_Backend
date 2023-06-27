import { BaseController } from '@/core/BaseController'
import { AdditiveService } from '@/modules/additive/service'
import { AdditivePolicy } from '@/modules/additive/policies'
import { AdditiveView } from '@/modules/additive/views'

export class AdditiveController extends BaseController {
	constructor() {
		super(new AdditiveService(), new AdditivePolicy(), new AdditiveView())
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
		this.delete = this.delete.bind(this)
		this.create = this.create.bind(this)
		this.update = this.update.bind(this)
	}
}
