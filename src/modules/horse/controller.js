import { BaseController } from '@/core/BaseController'
import { HorseService } from '@/modules/horse/service'
import { HorsePolicy } from '@/modules/horse/policies'
import { HorseView } from '@/modules/horse/views'
import { User } from '@/modules/authentication/model'
import { Contact } from '@/modules/contact/model'
import { Pension } from '@/modules/pension/model'

export class HorseController extends BaseController {
	constructor() {
		super(new HorseService(), new HorsePolicy(), new HorseView())
		this.index = this.index.bind(this)
		this.show = this.show.bind(this)
		this.delete = this.delete.bind(this)
		this.create = this.create.bind(this)
		this.update = this.update.bind(this)
		this._getRelationOptions = this._getRelationOptions.bind(this)
	}

	async index(request, response, next) {
		return await super.index(request, response, next, this._getRelationOptions())
	}

	async show(request, response, next) {
		return await super.show(request, response, next, this._getRelationOptions())
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
					model: User,
					as: 'owner',
					attributes: ['email'],
					include: {
						model: Contact,
						as: 'contact',
					},
				},
				{
					model: Pension,
					as: 'pension',
				},
				{
					model: User,
					as: 'horsemen',
					attributes: ['email'],
					include: {
						model: Contact,
						as: 'contact',
					},
				},
			],
		}
	}
}
