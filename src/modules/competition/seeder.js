import { QueryTypes } from 'sequelize'
import { Competition } from '@/modules/competition/model'
import { RoleService } from '@/modules/role/service'
import { ArrayUtils } from '@/utils/ArrayUtils'
import { CompetitionFactory } from '@/modules/competition/factory'
import { Role } from '@/modules/role/model'
import { User } from '@/modules/authentication/model'

export const upCompetition = async queryInterface => {
	const roleService = new RoleService()
	const roles = await queryInterface.sequelize.query(`SELECT * FROM ${Role.getTable()}`, { type: QueryTypes.SELECT })

	const adminRoleIds = await roleService.getSubRoleIds(roles.find(role => role.name === 'ADMIN'))
	const employeeRoleIds = await roleService.getSubRoleIds(roles.find(role => role.name === 'EMPLOYEE'))

	const adminAndEmployeeUsers = await queryInterface.sequelize.query(
		`SELECT * FROM ${User.getTable()} WHERE "roleId" IN (${[...adminRoleIds, ...employeeRoleIds].join(',')})`,
		{ type: QueryTypes.SELECT }
	)

	const competitionObjs = []
	for (let i = 0; i < 50; i++) {
		competitionObjs.push(CompetitionFactory.create(ArrayUtils.getRandomElement(adminAndEmployeeUsers).id))
	}

	await queryInterface.bulkInsert(Competition.getTable(), competitionObjs)
}

export const downCompetition = async queryInterface => {
	await queryInterface.bulkDelete(Competition.getTable(), null, { force: true })
}
