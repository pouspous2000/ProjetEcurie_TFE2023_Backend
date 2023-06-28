import { BaseController } from '@/core/BaseController'
import { HorseService } from '@/modules/horse/service'
import { HorsePolicy } from '@/modules/horse/policies'
import { HorseView } from '@/modules/horse/views'

export class HorseController extends BaseController {
	constructor() {
		super(new HorseService(), new HorsePolicy(), new HorseView())
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
		this.delete = this.delete.bind(this)
		this.create = this.create.bind(this)
		this.update = this.update.bind(this)
	}
}
