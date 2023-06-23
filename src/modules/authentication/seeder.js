import { Op } from 'sequelize'
import { User } from '@/modules/authentication/model'
import { Role } from '@/modules/role/model'
import { UserFactory } from '@/modules/authentication/factory'

export const upUser = async queryInterface => {
	const users = []

	const roles = await queryInterface.rawSelect(
		Role.getTable(),
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
	const admin = roles.find(role => role.name === 'ADMIN')
	const roleIds = roles.map(role => role.id)
	users.push(UserFactory.createCecile(admin.id))
	users.push(...UserFactory.bulkCreate(5, roleIds, false))
	users.push(...UserFactory.bulkCreate(5, roleIds, true))
	await queryInterface.bulkInsert(User.getTable(), users)
}

export const downUser = async queryInterface => {
	await queryInterface.bulkDelete(User.getTable(), null, {})
}
