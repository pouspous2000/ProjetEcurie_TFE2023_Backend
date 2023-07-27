import { QueryTypes } from 'sequelize'
import { Horse } from '@/modules/horse/model'
import { PensionData } from '@/modules/pension-data/model'
import { Pension } from '@/modules/pension/model'

export const upPensionData = async queryInterface => {
	const pensions = await queryInterface.sequelize.query(`SELECT * FROM ${Pension.getTable()}`, {
		type: QueryTypes.SELECT,
	})
	const horses = await queryInterface.sequelize.query(`SELECT * FROM ${Horse.getTable()}`, {
		type: QueryTypes.SELECT,
	})

	const pensionDataObjects = horses.map(horse => {
		const pension = pensions.find(pension => pension.id === horse.pensionId)
		return {
			horseId: horse.id,
			pensionId: horse.pensionId,
			name: pension.name,
			monthlyPrice: pension.monthlyPrice,
			description: pension.description,
			createdAt: new Date(),
			deletedAt: null,
		}
	})

	await queryInterface.bulkInsert(PensionData.getTable(), pensionDataObjects)
}

export const downPensionData = async queryInterface => {
	await queryInterface.bulkDelete(PensionData.getTable(), null, { force: true })
}
