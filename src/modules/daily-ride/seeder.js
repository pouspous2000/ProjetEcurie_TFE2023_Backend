import { QueryTypes } from 'sequelize'
import { DailyRide } from '@/modules/daily-ride/model'
import { TaskFactory } from '@/modules/task/factory'
import { RoleService } from '@/modules/role/service'
import { ArrayUtils } from '@/utils/ArrayUtils'
import { Task } from '@/modules/task/model'
import { Role } from '@/modules/role/model'
import { Ride } from '@/modules/ride/model'
import { Horse } from '@/modules/horse/model'
import { User } from '@/modules/authentication/model'

export const upDailyRide = async queryInterface => {
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

	const rides = await queryInterface.sequelize.query(`SELECT * FROM ${Ride.getTable()}`, { type: QueryTypes.SELECT })
	const horsesWithRideIds = rides.map(ride => ride.horseId)
	const dayRide = rides.find(ride => ride.period === 'DAY')
	const horses = await queryInterface.sequelize.query(`SELECT * FROM ${Horse.getTable()}`, {
		type: QueryTypes.SELECT,
	})
	const horsesWithoutRide = horses.filter(horse => !horsesWithRideIds.includes(horse.id))

	const dailyRideObjs = []

	for (let j = 0; j < horsesWithoutRide.length; j++) {
		const horse = horsesWithoutRide[j]
		const maxDailyRides = 3
		const minDailyRides = 1
		const nbDailRides = Math.floor(Math.random() * (maxDailyRides - minDailyRides + 1)) + minDailyRides

		const taskObjs = []
		for (let i = 0; i < nbDailRides; i++) {
			taskObjs.push(
				TaskFactory.create(
					ArrayUtils.getRandomElement(adminUsers).id,
					ArrayUtils.getRandomElement(employeeUsers).id
				)
			)
		}
		const taskIds = await queryInterface.bulkInsert(Task.getTable(), taskObjs, { returning: ['id'] })

		const horseDailyRides = taskIds.map(taskId => {
			return {
				horseId: horse.id,
				rideId: dayRide.id,
				taskId: taskId.id,
				name: dayRide.name,
				period: dayRide.period,
				price: dayRide.price,
				createdAt: new Date(),
				deletedAt: null,
			}
		})

		dailyRideObjs.push(...horseDailyRides)
	}
	await queryInterface.bulkInsert(DailyRide.getTable(), dailyRideObjs)
}

export const downDailyRide = async queryInterface => {
	await queryInterface.bulkDelete(DailyRide.getTable(), null, { force: true })
}
