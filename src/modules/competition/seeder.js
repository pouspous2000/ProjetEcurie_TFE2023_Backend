import { Op } from 'sequelize'
import { Competition } from '@/modules/competition/model'
import { Role } from '@/modules/role/model'
import { User } from '@/modules/authentication/model'
import { RoleService } from '@/modules/role/service'
import { ArrayUtils } from '@/utils/ArrayUtils'
import { CompetitionFactory } from '@/modules/competition/factory'

export const upCompetition = async queryInterface => {
	const roleService = new RoleService()
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

	const adminRoleIds = await roleService.getSubRoleIds(roles.find(role => role.name === 'ADMIN'))
	const employeeRoleIds = await roleService.getSubRoleIds(roles.find(role => role.name === 'EMPLOYEE'))

	const adminAndEmployeeUsers = await queryInterface.rawSelect(
		User.getTable(),
		{
			where: {
				roleId: {
					[Op.in]: [...adminRoleIds, ...employeeRoleIds],
				},
			},
			plain: false,
		},
		['id']
	)

	const competitionObjs = []
	for (let i = 0; i < 50; i++) {
		competitionObjs.push(CompetitionFactory.create(ArrayUtils.getRandomElement(adminAndEmployeeUsers).id))
	}

	await queryInterface.bulkInsert(Competition.getTable(), competitionObjs)
}

export const downCompetition = async queryInterface => {
	await queryInterface.bulkDelete(Competition.getTable(), null, {})
}
