import { QueryTypes } from 'sequelize'
import { Role } from '@/modules/role/model'
import { User } from '@/modules/authentication/model'
import { Lesson } from '@/modules/lesson/model'
import { RoleService } from '@/modules/role/service'
import { ArrayUtils } from '@/utils/ArrayUtils'
import { LessonFactory } from '@/modules/lesson/factory'

export const upLesson = async queryInterface => {
	const roleService = new RoleService()
	const roles = await queryInterface.sequelize.query(`SELECT * FROM ${Role.getTable()}`, { type: QueryTypes.SELECT })

	const adminRoleIds = await roleService.getSubRoleIds(roles.find(role => role.name === 'ADMIN'))
	const employeeRoleIds = await roleService.getSubRoleIds(roles.find(role => role.name === 'EMPLOYEE'))
	const clientRoleIds = await roleService.getSubRoleIds(roles.find(role => role.name === 'CLIENT'))

	const creatorRoleIds = [...adminRoleIds, ...employeeRoleIds]

	const creatorUsers = await queryInterface.sequelize.query(
		`SELECT * FROM ${User.getTable()} WHERE "roleId" IN (${creatorRoleIds})`,
		{ type: QueryTypes.SELECT }
	)
	const clientUsers = await queryInterface.sequelize.query(
		`SELECT * FROM ${User.getTable()} WHERE "roleId" IN (${clientRoleIds})`,
		{ type: QueryTypes.SELECT }
	)

	const statuses = ['CONFIRMED', 'DONE', 'CANCELLED', 'ABSENCE']
	const lessonObjs = []

	for (let i = 0; i < 50; i++) {
		lessonObjs.push(
			LessonFactory.create(
				ArrayUtils.getRandomElement(creatorUsers).id,
				ArrayUtils.getRandomElement(clientUsers).id,
				ArrayUtils.getRandomElement(statuses)
			)
		)
	}
	await queryInterface.bulkInsert(Lesson.getTable(), lessonObjs)
}

export const downLesson = async queryInterface => {
	await queryInterface.bulkDelete(Lesson.getTable(), null, {})
}
