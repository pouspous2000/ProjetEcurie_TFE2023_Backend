import { Op } from 'sequelize'
import { BaseController } from '@/core/BaseController'
import { LessonService } from '@/modules/lesson/service'
import { LessonPolicy } from '@/modules/lesson/policies'
import { LessonView } from '@/modules/lesson/views'
import { User } from '@/modules/authentication/model'
import { Contact } from '@/modules/contact/model'

export class LessonController extends BaseController {
	constructor() {
		super(new LessonService(), new LessonPolicy(), new LessonView())
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
		this.delete = this.delete.bind(this)
	}

	async index(request, response, next) {
		const { creatorId, clientId, startingAt, status } = request.query
		return await super.index(request, response, next, {
			...this._getRelationOptions(),
			...this._getIndexWhereClause(creatorId, clientId, startingAt, status),
		})
	}

	async show(request, response, next) {
		return await super.show(request, response, next, this._getRelationOptions())
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
					as: 'client',
					include: {
						model: Contact,
						as: 'contact',
					},
				},
			],
		}
	}

	_getIndexWhereClause(creatorId, clientId, startingAt, status) {
		const queryConditions = [
			creatorId ? { creatorId } : null,
			clientId ? { clientId } : null,
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
