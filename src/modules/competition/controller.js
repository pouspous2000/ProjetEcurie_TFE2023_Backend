import { Op } from 'sequelize'
import { User } from '@/modules/authentication/model'
import { Contact } from '@/modules/contact/model'
import { BaseController } from '@/core/BaseController'
import { CompetitionService } from '@/modules/competition/service'
import { CompetitionPolicy } from '@/modules/competition/policies'
import { CompetitionView } from '@/modules/competition/views'

export class CompetitionController extends BaseController {
	// this is code duplication with event , but we will keep the separation as we could handle competitions and events in different ways
	constructor() {
		super(new CompetitionService(), new CompetitionPolicy(), new CompetitionView())
		this._getIndexWhereClause = this._getIndexWhereClause.bind(this)
		this._getRelationOptions = this._getRelationOptions.bind(this)
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
		this.delete = this.delete.bind(this)
		this.create = this.create.bind(this)
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
		request.body.creatorId = request.user.id
		return await super.create(request, response, next, this._getRelationOptions())
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
