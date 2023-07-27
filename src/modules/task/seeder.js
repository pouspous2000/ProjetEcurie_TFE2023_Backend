import { QueryTypes } from 'sequelize'
import { Task } from '@/modules/task/model'
import { User } from '@/modules/authentication/model'
import { Role } from '@/modules/role/model'
import { RoleService } from '@/modules/role/service'
import { TaskFactory } from '@/modules/task/factory'
import { ArrayUtils } from '@/utils/ArrayUtils'

export const upTask = async queryInterface => {
	const roleService = new RoleService()
	const roles = await queryInterface.sequelize.query(`SELECT * FROM ${Role.getTable()}`, { type: QueryTypes.SELECT })

	const adminRoleIds = await roleService.getSubRoleIds(roles.find(role => role.name === 'ADMIN'))
	const employeeRoleIds = await roleService.getSubRoleIds(roles.find(role => role.name === 'EMPLOYEE'))

	const adminUsers = await queryInterface.sequelize.query(
		`
		SELECT * FROM ${User.getTable()}
		WHERE "roleId" IN (${adminRoleIds.join(', ')})
	`,
		{ type: QueryTypes.SELECT }
	)

	const employeeUsers = await queryInterface.sequelize.query(
		`
		SELECT * FROM ${User.getTable()}
		WHERE "roleId" in (${employeeRoleIds.join(', ')})
	`,
		{ type: QueryTypes.SELECT }
	)

	const statuses = ['PENDING', 'CONFIRMED', 'IN PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED']
	const taskObjs = []

	for (let i = 0; i < 50; i++) {
		taskObjs.push(
			TaskFactory.create(
				ArrayUtils.getRandomElement(adminUsers).id,
				ArrayUtils.getRandomElement(employeeUsers).id,
				ArrayUtils.getRandomElement(statuses)
			)
		)
	}

	await queryInterface.bulkInsert(Task.getTable(), taskObjs)
}

export const downTask = async queryInterface => {
	await queryInterface.bulkDelete(Task.getTable(), null, { force: true })
}
