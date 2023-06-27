import { HorseContributor } from '@/modules/horse-contributor/model'
import { BaseService } from '@/core/BaseService'

export class HorseContributorService extends BaseService {
	constructor() {
		super(HorseContributor.getModelName(), 'horseContributor_404')
	}
}
