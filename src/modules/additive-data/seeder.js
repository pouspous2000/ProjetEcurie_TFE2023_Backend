import { Op } from 'sequelize'
import { AdditiveHorse } from '@/modules/additive-data/model'
import { Additive } from '@/modules/additive/model'
import { Horse } from '@/modules/horse/model'
import { ArrayUtils } from '@/utils/ArrayUtils'

export const upAdditiveHorse = async queryInterface => {
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
			createdAt: new Date(),
			deletedAt: null,
		}
	})

	await queryInterface.bulkInsert(AdditiveHorse.getTable(), additiveDataObjs)
}

export const downAdditiveHorse = async queryInterface => {
	await queryInterface.bulkDelete(AdditiveHorse.getTable(), null, {})
}
