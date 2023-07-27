import { QueryTypes } from 'sequelize'
import { Horse } from '@/modules/horse/model'
import { User } from '@/modules/authentication/model'
import { Pension } from '@/modules/pension/model'
import { HorseFactory } from '@/modules/horse/factory'
import { ArrayUtils } from '@/utils/ArrayUtils'

export const upHorse = async queryInterface => {
	const users = await queryInterface.sequelize.query(`SELECT * FROM ${User.getTable()}`, { type: QueryTypes.SELECT })
	const pensions = await queryInterface.sequelize.query(`SELECT * FROM ${Pension.getTable()}`, {
		type: QueryTypes.SELECT,
	})

	const horseObjects = []
	for (let i = 0; i < 20; i++) {
		horseObjects.push(
			HorseFactory.create(ArrayUtils.getRandomElement(users).id, ArrayUtils.getRandomElement(pensions).id)
		)
	}
	await queryInterface.bulkInsert(Horse.getTable(), horseObjects)
}

export const downHorse = async queryInterface => {
	await queryInterface.bulkDelete(Horse.getTable(), null, { force: true })
}
