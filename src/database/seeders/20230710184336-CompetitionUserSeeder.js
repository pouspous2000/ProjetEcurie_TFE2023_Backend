import { Op } from 'sequelize'
import { CompetitionUser } from '@/database/models/competition-user'
import { RoleService } from '@/modules/role/service'
import { Role } from '@/modules/role/model'
import { User } from '@/modules/authentication/model'
import { Competition } from '@/modules/competition/model'

export const up = async queryInterface => {
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

	const clientRoleIds = await roleService.getSubRoleIds(roles.find(role => role.name === 'CLIENT'))
	const clientUsers = await queryInterface.rawSelect(
		User.getTable(),
		{
			where: {
				roleId: {
					[Op.in]: clientRoleIds,
				},
			},
			plain: false,
		},
		['id']
	)

	const competitions = await queryInterface.rawSelect(
		Competition.getTable(),
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

	const competitionUserObjs = []
	const shuffledClientUserIds = clientUsers.map(clientUser => clientUser.id).sort(() => 0.5 - Math.random())
	competitions.forEach(competition => {
		const nbClientsForThisEvent = Math.floor(Math.random() * shuffledClientUserIds.length)
		const clientUserIds = shuffledClientUserIds.slice(0, nbClientsForThisEvent)
		clientUserIds.forEach(clientId => {
			competitionUserObjs.push({
				userId: clientId,
				competitionId: competition.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
		})
	})

	await queryInterface.bulkInsert(CompetitionUser.getTable(), competitionUserObjs)
}

export const down = async queryInterface => await queryInterface.bulkDelete(CompetitionUser.getTable(), null, {})
