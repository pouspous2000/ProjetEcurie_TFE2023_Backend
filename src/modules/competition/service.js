import { BaseService } from '@/core/BaseService'
import { Competition } from '@/modules/competition/model'

export class CompetitionService extends BaseService {
	constructor() {
		super(Competition.getModelName(), 'competition_404')
	}
}
