import db from '@/database'
import { Pension } from '@/modules/pension/model'
import { BaseService } from '@/core/BaseService'
import { PensionDataService } from '@/modules/pensionData/service'

export class PensionService extends BaseService {
	constructor() {
		super(Pension.getModelName(), 'pension_404')
		this._pensionDataService = new PensionDataService()
	}

	async update(instance, data) {
		const transaction = await db.transaction()
		try {
			const pension = await super.update(instance, data)
			await this._pensionDataService.updatePensionDataAfterPensionUpdate(pension)
			await transaction.commit()
			return pension
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}

	async delete(instance) {
		const transaction = await db.transaction()
		try {
			await this._pensionDataService.updatePensionDataAfterPensionDelete(instance)
			const pension = await super.delete(instance)
			transaction.commit()
			return pension
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}
}
