import { QueryTypes } from 'sequelize'
import { Event } from '@/modules/event/model'
import { Role } from '@/modules/role/model'
import { User } from '@/modules/authentication/model'
import { RoleService } from '@/modules/role/service'
import { ArrayUtils } from '@/utils/ArrayUtils'
import { Eventfactory } from '@/modules/event/factory'

export const upEvent = async queryInterface => {
	const roleService = new RoleService()
	const roles = await queryInterface.sequelize.query(`SELECT * FROM ${Role.getTable()}`, { type: QueryTypes.SELECT })

	const adminRoleIds = await roleService.getSubRoleIds(roles.find(role => role.name === 'ADMIN'))
	const employeeRoleIds = await roleService.getSubRoleIds(roles.find(role => role.name === 'EMPLOYEE'))

	const adminAndEmployeeUsers = await queryInterface.sequelize.query(
		`
		SELECT * FROM ${User.getTable()} 
		WHERE "roleId"
		IN (${[...adminRoleIds, ...employeeRoleIds].join(',')})
	`,
		{ type: QueryTypes.SELECT }
	)

	const eventObjs = []
	for (let i = 0; i < 50; i++) {
		eventObjs.push(Eventfactory.create(ArrayUtils.getRandomElement(adminAndEmployeeUsers).id))
	}

	await queryInterface.bulkInsert(Event.getTable(), eventObjs)
}

export const downEvent = async queryInterface => {
	await queryInterface.bulkDelete(Event.getTable(), null, { force: true })
}
