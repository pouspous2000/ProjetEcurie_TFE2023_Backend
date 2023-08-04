import db from '@/database'
import { Pension } from '@/modules/pension/model'
import { BaseService } from '@/core/BaseService'
import { PensionDataService } from '@/modules/pension-data/service'
import createError from 'http-errors'
import i18next from 'i18next'

export class PensionService extends BaseService {
	constructor() {
		super(Pension.getModelName(), 'pension_404')
		this._pensionDataService = new PensionDataService()
	}

	async update(pension, data) {
		const transaction = await db.transaction()
		try {
			const pensionUpdated = await super.update(pension, data)
			await this._pensionDataService.updatePensionDataAfterPensionUpdate(pension)
			await transaction.commit()
			return pensionUpdated
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}

	async delete(pension) {
		const transaction = await db.transaction()
		try {
			await this._checkIfPensionDataNotDeletedBeforeDelete(pension)
			await this._pensionDataService.updatePensionDataAfterPensionDelete(pension)
			const pensionDeleted = await super.delete(pension)
			await transaction.commit()
			return pensionDeleted
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}

	async _checkIfPensionDataNotDeletedBeforeDelete(pension) {
		const pensionDataNotDeletedForThisPension = await db.models.PensionData.findAll({
			where: {
				pensionId: pension.id,
			},
		})
		if (pensionDataNotDeletedForThisPension && pensionDataNotDeletedForThisPension.length) {
			throw createError(422, i18next.t('pension_422_cannotDeletePension'))
		}
	}
}
