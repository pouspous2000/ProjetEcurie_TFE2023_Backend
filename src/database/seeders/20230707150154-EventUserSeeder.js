import { Op } from 'sequelize'
import { EventUser } from '@/database/models/event-user'
import { RoleService } from '@/modules/role/service'
import { Role } from '@/modules/role/model'
import { User } from '@/modules/authentication/model'
import { Event } from '@/modules/event/model'

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

	const events = await queryInterface.rawSelect(
		Event.getTable(),
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

	const eventUserObjs = []
	const shuffledClientUserIds = clientUsers.map(clientUser => clientUser.id).sort(() => 0.5 - Math.random())
	events.forEach(event => {
		const nbClientsForThisEvent = Math.floor(Math.random() * shuffledClientUserIds.length)
		const clientUserIds = shuffledClientUserIds.slice(0, nbClientsForThisEvent)
		clientUserIds.forEach(clientId => {
			eventUserObjs.push({
				userId: clientId,
				eventId: event.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
		})
	})

	await queryInterface.bulkInsert(EventUser.getTable(), eventUserObjs)
}

export const down = async queryInterface => await queryInterface.bulkDelete(EventUser.getTable(), null, {})
