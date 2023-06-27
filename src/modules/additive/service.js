import { BaseService } from '@/core/BaseService'
import { Additive } from '@/modules/additive/model'

export class AdditiveService extends BaseService {
	constructor() {
		super(Additive.getModelName(), 'additive_404')
	}
}
