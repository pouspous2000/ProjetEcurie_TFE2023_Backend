import { Additive } from '@/modules/additive/model'
import { AdditiveFactory } from '@/modules/additive/factory'

export const upAdditive = async queryInterface => {
	await queryInterface.bulkInsert(Additive.getTable(), AdditiveFactory.bulkCreate(10))
}

export const downAdditive = async queryInterface => {
	await queryInterface.bulkDelete(Additive.getTable(), null, {})
}
