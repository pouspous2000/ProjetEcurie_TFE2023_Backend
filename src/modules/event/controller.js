import { Op } from 'sequelize'
import { User } from '@/modules/authentication/model'
import { Contact } from '@/modules/contact/model'
import { BaseController } from '@/core/BaseController'
import { EventService } from '@/modules/event/service'
import { EventPolicy } from '@/modules/event/policies'
import { EventView } from '@/modules/event/views'

export class EventController extends BaseController {
	constructor() {
		super(new EventService(), new EventPolicy(), new EventView())
		this._getIndexWhereClause = this._getIndexWhereClause.bind(this)
		this._getRelationOptions = this._getRelationOptions.bind(this)
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
		this.delete = this.delete.bind(this)
		this.create = this.create.bind(this)
		this.update = this.update.bind(this)
		this.subscribe = this.subscribe.bind(this)
	}

	async index(request, response, next) {
		const { creatorId, startingAt, endingAt, participants } = request.query

		return await super.index(request, response, next, {
			...this._getRelationOptions(),
			...this._getIndexWhereClause(creatorId, startingAt, endingAt, participants),
		})
	}

	async show(request, response, next) {
		return await super.show(request, response, next, this._getRelationOptions())
	}

	async create(request, response, next) {
		return await super.create(request, response, next, this._getRelationOptions(), { creatorId: request.user.id })
	}

	async update(request, response, next) {
		return await super.update(request, response, next, this._getRelationOptions())
	}

	async subscribe(request, response, next) {
		try {
			const { id } = request.params
			const userId = request.user.id
			let event = await this._service.findOrFail(id)
			await this._service.subscribe(event, userId)
			return response
				.status(200)
				.json(this._view.show(await this._service.findOrFail(event.id, this._getRelationOptions())))
		} catch (error) {
			return next(error)
		}
	}

	_getRelationOptions() {
		return {
			include: [
				{
					model: User,
					as: 'creator',
					attributes: ['email'],
					include: {
						model: Contact,
						as: 'contact',
					},
				},
				{
					model: User,
					as: 'participants',
					attributes: ['email'],
					include: {
						model: Contact,
						as: 'contact',
					},
				},
			],
		}
	}

	_getIndexWhereClause(creatorId, startingAt, endingAt, participants) {
		participants = participants ? participants.split(',').map(participant => Number.parseInt(participant)) : null
		const queryConditions = [
			creatorId ? { creatorId } : null,
			startingAt ? { startingAt: { [Op.gte]: startingAt } } : null,
			endingAt ? { endingAt: { [Op.lte]: endingAt } } : null,
			participants ? { '$participants.contact.userId$': { [Op.in]: participants } } : null,
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
