import { BaseService } from '@/core/BaseService'
import { Stable } from '@/modules/stable/model'

export class StableService extends BaseService {
	constructor() {
		super(Stable.getModelName(), 'stable_404')
	}
}
