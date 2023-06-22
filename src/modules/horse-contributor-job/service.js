import { BaseService } from '@/core/BaseService'
import { HorseContributorJob } from '@/modules/horse-contributor-job/model'

export class HorseContributorJobService extends BaseService {
	constructor() {
		super(HorseContributorJob.getModelName(), 'horseContributorJob_404')
	}
}
