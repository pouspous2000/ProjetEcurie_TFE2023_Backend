import { Stable } from '@/modules/stable/model'
import { StableFactory } from '@/modules/stable/factory'

export const upStable = async queryInterface => {
	await queryInterface.bulkInsert(Stable.getTable(), [StableFactory.createBonnet()])
}

export const downStable = async queryInterface => {
	await queryInterface.bulkDelete(Stable.getTable(), null, {})
}
