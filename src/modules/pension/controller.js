import { BaseController } from '@/core/BaseController'
import { PensionService } from '@/modules/pension/service'
import { PensionPolicy } from '@/modules/pension/policies'
import { PensionView } from '@/modules/pension/views'

export class PensionController extends BaseController {
	constructor() {
		super(new PensionService(), new PensionPolicy(), new PensionView())
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
		this.delete = this.delete.bind(this)
		this.create = this.create.bind(this)
		this.update = this.update.bind(this)
	}
}
