import { Op } from 'sequelize'
import createError from 'http-errors'
import { BaseService } from '@/core/BaseService'
import { DailyRide } from '@/modules/daily-ride/model'
import { TaskService } from '@/modules/task/service'
import { RoleService } from '@/modules/role/service'
import db from '@/database'
import i18next from '../../../i18n'

export class DailyRideService extends BaseService {
	constructor() {
		super(DailyRide.getModelName(), 'dailyRide_404')
		this._taskService = new TaskService()
		this._roleService = new RoleService()
	}

	async delete(dailyRide) {
		if (['IN PROGRESS', 'COMPLETED', 'BLOCKED'].includes(dailyRide.task.status)) {
			throw createError(422, i18next.t('dailyRide_422_delete_when_status'))
		} else if (['PENDING', 'CONFIRMED'].includes(dailyRide.task.status)) {
			const transaction = await db.transaction()
			try {
				await this._taskService.update(dailyRide.task, { status: 'CANCELLED' })
				const response = await dailyRide.destroy()
				await transaction.commit()
				return response
			} catch (error) {
				await transaction.rollback()
				throw error
			}
		} else {
			return await dailyRide.destroy()
		}
	}

	async create(data) {
		const transaction = await db.transaction()
		try {
			const horse = await this._getHorse(data.horseId)
			const ride = await this._getRideDay()
			const adminUser = await this._getAdminUser()

			const task = await this._taskService.create({
				creatorId: adminUser.id,
				employeeId: adminUser.id,
				name: `${i18next.t('dailyRide')} ${horse.name}`,
				description: `${i18next.t('dailyRide')} ${horse.name}`,
				startingAt: data.task.startingAt,
				endingAt: new Date(new Date(data.task.startingAt).getTime() + 60 * 60 * 1000), // 1 hour in ms
				remark: data.task.remark,
			})

			const dailyRide = await db.models.DailyRide.create({
				horseId: horse.id,
				rideId: ride.id,
				taskId: task.id,
				name: ride.name,
				period: ride.period,
				price: ride.price,
				deletedAt: null,
			})

			await transaction.commit()
			return dailyRide
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}

	async _getHorse(horseId) {
		const horse = await db.models.Horse.findByPk(horseId)
		if (!horse) {
			throw createError(422, i18next.t('dailyRide_422_inexistingHorse'))
		}
		return horse
	}

	async _getRideDay() {
		const ride = await db.models.Ride.findOne({ where: { period: 'DAY' } })
		if (!ride) {
			throw createError(422, i18next.t('dailyRide_422_inexistingRideDay'))
		}
		return ride
	}

	async _getAdminUser() {
		let adminUser = undefined
		try {
			const adminRole = await this._roleService.getRoleByNameOrFail('ADMIN')
			const adminRolesIds = await this._roleService.getSubRoleIds(adminRole)
			const adminUsers = await db.models.User.findAll({
				where: {
					roleId: {
						[Op.in]: adminRolesIds,
					},
				},
			})
			adminUser = adminUsers[0]
		} catch (error) {
			throw createError(422, i18next.t('dailyRide_422_inexistingAdminUser'))
		}
		if (!adminUser) {
			throw createError(422, i18next.t('dailyRide_422_inexistingAdminUser'))
		}
		return adminUser
	}
}
