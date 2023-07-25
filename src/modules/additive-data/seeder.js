import { Op } from 'sequelize'
import { AdditiveData } from '@/modules/additive-data/model'
import { Additive } from '@/modules/additive/model'
import { Horse } from '@/modules/horse/model'
import { ArrayUtils } from '@/utils/ArrayUtils'

export const upAdditiveData = async queryInterface => {
	const additives = await queryInterface.rawSelect(
		Additive.getTable(),
		{
			where: { id: { [Op.ne]: 0 } },
			plain: false,
		},
		['id']
	)

	const horses = await queryInterface.rawSelect(
		Horse.getTable(),
		{
			where: { id: { [Op.ne]: 0 } },
			plain: false,
		},
		['id']
	)

	const additiveDataObjs = horses.map(horse => {
		const additive = ArrayUtils.getRandomElement(additives)
		return {
			additiveId: additive.id,
			horseId: horse.id,
			name: additive.name,
			price: additive.price,
			status: 'ACTIVE',
			createdAt: new Date(),
		}
	})

	await queryInterface.bulkInsert(AdditiveData.getTable(), additiveDataObjs)
}

export const downAdditiveData = async queryInterface => {
	await queryInterface.bulkDelete(AdditiveData.getTable(), null, {})
}
