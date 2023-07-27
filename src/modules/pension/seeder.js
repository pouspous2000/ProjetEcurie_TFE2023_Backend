import { Pension } from '@/modules/pension/model'
import { PensionFactory } from '@/modules/pension/factory'

export const upPension = async queryInterface => {
	await queryInterface.bulkInsert(Pension.getTable(), PensionFactory.bulkCreate(10))
}
export const downPension = async queryInterface => {
	await queryInterface.bulkDelete(Pension.getTable(), null, { force: true })
}
