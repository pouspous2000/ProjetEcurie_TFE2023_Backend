import { QueryTypes } from 'sequelize'
import { hash } from 'bcrypt'
import { User } from '@/modules/authentication/model'
import { Role } from '@/modules/role/model'
import { UserFactory } from '@/modules/authentication/factory'

export const upUser = async queryInterface => {
	const users = []
	const roles = await queryInterface.sequelize.query(`SELECT * FROM ${Role.getTable()}`, { type: QueryTypes.SELECT })

	const admin = roles.find(role => role.name === 'ADMIN')
	const roleIds = roles.map(role => role.id)
	const roleClientId = roles.find(role => role.name === 'CLIENT').id

	users.push(UserFactory.createCecile(admin.id))
	users.push(...UserFactory.bulkCreate(10, roleIds, true))
	users.push(...UserFactory.bulkCreate(10, [roleClientId], true))

	for (const user of users) {
		user.password = await hash(user.password, 10)
	}

	await queryInterface.bulkInsert(User.getTable(), users)
}

export const downUser = async queryInterface => {
	await queryInterface.bulkDelete(User.getTable(), null, { force: true })
}
