import { Op } from 'sequelize'
import { Horse } from '@/modules/horse/model'
import { User } from '@/modules/authentication/model'
import { Pension } from '@/modules/pension/model'
import { HorseFactory } from '@/modules/horse/factory'
import { ArrayUtils } from '@/utils/ArrayUtils'

export const upHorse = async queryInterface => {
	const users = await queryInterface.rawSelect(
		User.getTable(),
		{
			where: {
				id: {
					[Op.ne]: 0,
				},
			},
			plain: false,
		},
		['id']
	)

	const pensions = await queryInterface.rawSelect(
		Pension.getTable(),
		{
			where: {
				id: {
					[Op.ne]: 0,
				},
			},
			plain: false,
		},
		['id']
	)

	const horseObjects = []
	for (let i = 0; i < 20; i++) {
		horseObjects.push(
			HorseFactory.create(ArrayUtils.getRandomElement(users).id, ArrayUtils.getRandomElement(pensions).id)
		)
	}
	await queryInterface.bulkInsert(Horse.getTable(), horseObjects)
}

export const downHorse = async queryInterface => {
	await queryInterface.bulkDelete(Horse.getTable(), null, {})
}
