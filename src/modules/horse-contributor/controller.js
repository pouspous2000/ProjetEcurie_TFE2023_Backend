import { BaseController } from '@/core/BaseController'
import { HorseContributorService } from '@/modules/horse-contributor/service'
import { HorseContributorPolicy } from '@/modules/horse-contributor/policies'
import { HorseContributorView } from '@/modules/horse-contributor/views'

export class HorseContributorController extends BaseController {
	constructor() {
		super(new HorseContributorService(), new HorseContributorPolicy(), new HorseContributorView())
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
		this.delete = this.delete.bind(this)
		this.create = this.create.bind(this)
		this.update = this.update.bind(this)
	}
}
