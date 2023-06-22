import { BaseController } from '@/core/BaseController'
import { HorseContributorJobService } from '@/modules/horse-contributor-job/service'
import { HorseContributorJobView } from '@/modules/horse-contributor-job/views'

export class HorseContributorJobController extends BaseController {
	constructor() {
		super(new HorseContributorJobService(), new HorseContributorJobView())
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
		this.delete = this.delete.bind(this)
		this.create = this.create.bind(this)
		this.update = this.update.bind(this)
	}
}
