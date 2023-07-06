import { Op } from 'sequelize'
import { BaseController } from '@/core/BaseController'
import { TaskService } from '@/modules/task/service'
import { TaskPolicy } from '@/modules/task/policies'
import { TaskView } from '@/modules/task/views'
import { User } from '@/modules/authentication/model'
import { Contact } from '@/modules/contact/model'

export class TaskController extends BaseController {
	constructor() {
		super(new TaskService(), new TaskPolicy(), new TaskView())
		this._getRelationOptions = this._getRelationOptions.bind(this)
		this._getIndexWhereClause = this._getIndexWhereClause.bind(this)
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
		this.delete = this.delete.bind(this)
		this.create = this.create.bind(this)
		this.update = this.update.bind(this)
	}

	async index(request, response, next) {
		const { employeeId, creatorId, startingAt, status } = request.query
		const queryOptions = this._getIndexWhereClause(employeeId, creatorId, startingAt, status)
		const relationOptions = this._getRelationOptions()
		return await super.index(request, response, next, { ...relationOptions, ...queryOptions })
	}

	async show(request, response, next) {
		return await super.show(request, response, next, this._getRelationOptions())
	}

	async create(request, response, next) {
		request.body.creatorId = request.user.id
		return await super.create(request, response, next, this._getRelationOptions())
	}

	async update(request, response, next) {
		return await super.update(request, response, next, this._getRelationOptions())
	}

	_getRelationOptions() {
		return {
			include: [
				{
					model: User,
					as: 'creator',
					include: {
						model: Contact,
						as: 'contact',
					},
				},
				{
					model: User,
					as: 'employee',
					include: {
						model: Contact,
						as: 'contact',
					},
				},
			],
		}
	}

	_getIndexWhereClause(employeeId, creatorId, startingAt, status) {
		const queryConditions = [
			employeeId ? { employeeId } : null,
			creatorId ? { creatorId } : null,
			startingAt ? { startingAt: { [Op.gte]: startingAt } } : null,
			status ? { status } : null,
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
