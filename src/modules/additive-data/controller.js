import { User } from '@/modules/authentication/model'
import { Contact } from '@/modules/contact/model'
import { Pension } from '@/modules/pension/model'
import { Ride } from '@/modules/ride/model'
import { AdditiveData } from '@/modules/additive-data/model'

import { HorseView } from '@/modules/horse/views'
import { AdditiveDataPolicy } from '@/modules/additive-data/policies'
import { AdditiveDataService } from '@/modules/additive-data/service'

import db from '@/database'

export class AdditiveDataController {
	constructor() {
		this._service = new AdditiveDataService()
		this._policy = new AdditiveDataPolicy()
		this._view = new HorseView()
		this._getRelationOptions = this._getRelationOptions.bind(this)
		this.add = this.add.bind(this)
		this.cancel = this.cancel.bind(this)
	}

	async add(request, response, next) {
		const transaction = await db.transaction()
		try {
			const { horseId } = request.params
			const horse = await this._service.add(horseId, request.body.additiveIds, this._getRelationOptions())
			await this._policy.add(request, horse)
			await transaction.commit()
			return response.status(201).json(this._view.show(horse))
		} catch (error) {
			transaction.rollback()
			next(error)
		}
	}

	async cancel(request, response, next) {
		const transaction = await db.transaction()
		try {
			const { horseId } = request.params
			const horse = await this._service.cancel(horseId, request.body.additiveDataIds, this._getRelationOptions())
			await this._policy.cancel(request, horse)
			await transaction.commit()
			return response.status(201).json(this._view.show(horse))
		} catch (error) {
			transaction.rollback()
			next(error)
		}
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
				{
					model: AdditiveData,
					as: 'additiveDatas',
				},
				{
					model: Ride,
					as: 'ride',
				},
			],
		}
	}
}
