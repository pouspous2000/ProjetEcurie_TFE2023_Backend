import { Op } from 'sequelize'
import { Role } from '@/modules/role/model'
import { RoleFactory } from '@/modules/role/factory'
import { ArrayUtils } from '@/utils/ArrayUtils'

export const upRole = async queryInterface => {
	const roles = []
	roles.push(RoleFactory.createAdmin())
	roles.push(RoleFactory.createEmployee())
	roles.push(RoleFactory.createClient())

	if (process.env.NODE_ENV === 'DEV') {
		await queryInterface.bulkInsert(Role.getTable(), roles)

		const role1lvls = await queryInterface.rawSelect(
			Role.getTable(),
			{
				where: {
					name: {
						[Op.in]: roles.map(role => role.name),
					},
				},
				plain: false,
			},
			['id']
		)

		await queryInterface.bulkInsert(
			Role.getTable(),
			RoleFactory.bulkCreate(5).map(role => {
				return {
					...role,
					parentId: role1lvls[1].id,
				}
			})
		)

		const role2lvls = await queryInterface.rawSelect(
			Role.getTable(),
			{
				where: {
					name: {
						[Op.notIn]: roles.map(role => role.name),
					},
				},
				plain: false,
			},
			['id']
		)

		await queryInterface.bulkInsert(
			Role.getTable(),
			RoleFactory.bulkCreate(5).map(role => {
				return {
					...role,
					parentId: ArrayUtils.getRandomElement(role2lvls).id,
				}
			})
		)
	}
}

export const downRole = async queryInterface => {
	await queryInterface.bulkDelete(Role.getTable(), null, { force: true })
}
