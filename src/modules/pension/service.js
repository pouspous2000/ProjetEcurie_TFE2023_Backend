import { Pension } from '@/modules/pension/model'
import { BaseService } from '@/core/BaseService'

export class PensionService extends BaseService {
	constructor() {
		super(Pension.getModelName(), 'pension_404')
	}
}
