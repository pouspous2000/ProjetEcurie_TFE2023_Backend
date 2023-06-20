import { User } from '@/modules/authentication/model'
import { UserFactory } from '@/modules/authentication/factory'

export const upUser = async queryInterface => {
	const users = []
	users.push(await UserFactory.createCecile())
	users.push(...(await UserFactory.bulkCreate(5, false)))
	users.push(...(await UserFactory.bulkCreate(5, true)))
	await queryInterface.bulkInsert(User.getTable(), users)
}

export const downUser = async queryInterface => {
	await queryInterface.bulkDelete(User.getTable(), null, {})
}
