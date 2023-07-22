import { Op } from 'sequelize'
import { BaseController } from '@/core/BaseController'
import { DailyRideService } from '@/modules/daily-ride/service'
import { DailyRidePolicy } from '@/modules/daily-ride/policies'
import { DailyRideView } from '@/modules/daily-ride/views'

import { Horse } from '@/modules/horse/model'
import { Task } from '@/modules/task/model'

export class DailyRideController extends BaseController {
	constructor() {
		super(new DailyRideService(), new DailyRidePolicy(), new DailyRideView())
		this._getRelationOptions = this._getRelationOptions.bind(this)
		this._getIndexWhereClause = this._getIndexWhereClause.bind(this)
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
		this.delete = this.delete.bind(this)
		this.create = this.create.bind(this)
		this.update = this.update.bind(this)
	}

	async index(request, response, next) {
		const { horseId, horseName, taskStatus, taskStartingAt } = request.query
		return await super.index(request, response, next, {
			...this._getRelationOptions(),
			...this._getIndexWhereClause(horseId, horseName, taskStatus, taskStartingAt),
		})
	}

	async show(request, response, next) {
		return await super.show(request, response, next, this._getRelationOptions())
	}

	async delete(request, response, next) {
		return await super.delete(request, response, next, this._getRelationOptions())
	}

	async create(request, response, next) {
		return await super.create(request, response, next, this._getRelationOptions())
	}

	async update(request, response, next) {
		return await super.update(request, response, next, this._getRelationOptions())
	}

	_getRelationOptions() {
		return {
			include: [
				{
					model: Horse,
					as: 'horse',
				},
				{
					model: Task,
					as: 'task',
				},
			],
		}
	}

	_getIndexWhereClause(horseId, horseName, taskStatus, taskStartingAt) {
		const queryConditions = [
			horseId ? { horseId } : null,
			horseName ? { '$horse.name$': horseName } : null,
			taskStatus ? { '$task.status$': taskStatus } : null,
			taskStartingAt ? { '$task.startingAt$': { [Op.gte]: taskStartingAt } } : null,
		]

		if (queryConditions.filter(queryCondition => queryCondition).length === 0) {
			return {}
		}

		return {
			where: {
				[Op.and]: queryConditions.filter(queryCondition => queryCondition),
			},
		}
	}
}
