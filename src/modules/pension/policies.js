import { PensionService } from '@/modules/pension/service'

export class PensionPolicy {
	constructor() {
		this._pensionService = new PensionService()
	}

	async index(request, pensions) {
		return pensions
	}

	async show(request, pension) {
		return pension
	}
}
