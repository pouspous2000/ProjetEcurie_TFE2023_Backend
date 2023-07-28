import { User } from '@/modules/authentication/model'
import { Contact } from '@/modules/contact/model'
import { Pension } from '@/modules/pension/model'
import { AdditiveData } from '@/modules/additive-data/model'
import { Ride } from '@/modules/ride/model'
import { HorseContributorHorseContributorJob } from '@/modules/horseContributor-horseContributorJob/model'
import { HorseContributor } from '@/modules/horse-contributor/model'
import { HorseContributorJob } from '@/modules/horse-contributor-job/model'

import { HorseContributorHorseContributorJobService } from '@/modules/horseContributor-horseContributorJob/service'
import { HorseContributorHorseContributorJobPolicy } from '@/modules/horseContributor-horseContributorJob/policies'
import { HorseView } from '@/modules/horse/views'

import db from '@/database'

export class HorseContributorHorseContributorJobController {
	constructor() {
		this._service = new HorseContributorHorseContributorJobService()
		this._policy = new HorseContributorHorseContributorJobPolicy()
		this._view = new HorseView()
		this.addJobs = this.addJobs.bind(this)
		this.removeJobs = this.removeJobs.bind(this)
	}

	async addJobs(request, response, next) {
		const transaction = await db.transaction()
		try {
			const { horseId } = request.params
			const horse = await this._service.addJobs(
				horseId,
				request.body.horseContributorId,
				request.body.horseContributorJobIds,
				this._getRelationOptions()
			)
			await this._policy.addJobs(request, horse)
			await transaction.commit()
			return response.status(200).json(this._view.show(horse))
		} catch (error) {
			await transaction.rollback()
			next(error)
		}
	}

	async removeJobs(request, response, next) {
		const transaction = await db.transaction()
		try {
			const { horseId } = request.params
			const horse = await this._service.removeJobs(
				horseId,
				request.body.horseContributorHorseContributorJobIds,
				this._getRelationOptions()
			)
			await this._policy.removeJobs(request, horse)
			await transaction.commit()
			return response.status(200).json(this._view.show(horse))
		} catch (error) {
			await transaction.rollback()
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
				{
					model: HorseContributorHorseContributorJob,
					as: 'horseContributorHorseContributorJobs',
					include: [
						{
							model: HorseContributor,
							as: 'horseContributor',
						},
						{
							model: HorseContributorJob,
							as: 'horseContributorJob',
						},
					],
				},
			],
		}
	}
}
