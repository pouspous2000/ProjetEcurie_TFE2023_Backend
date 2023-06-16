import { HorseContributorJobService } from '@/modules/horse-contributor-job/service'
import { HorseContributorJobView } from '@/modules/horse-contributor-job/views'
import { SequelizeErrorFormatter } from '@/core/SequelizeErrorFormatter'

export class HorseContributorJobController {
	static async index(request, response, next) {
		try {
			const records = await HorseContributorJobService.index()
			return response.status(200).json(HorseContributorJobView.index(records))
		} catch (error) {
			return next(error)
		}
	}

	static async show(request, response, next) {
		const { id } = request.params
		try {
			const horseContributorJob = await HorseContributorJobService.findOrFail(id)
			return response.status(200).json(horseContributorJob)
		} catch (error) {
			return next(error)
		}
	}

	static async delete(request, response, next) {
		const { id } = request.params
		try {
			const horseContributorJob = await HorseContributorJobService.findOrFail(id)
			await HorseContributorJobService.delete(horseContributorJob)
			return response.status(204).send()
		} catch (error) {
			return next(error)
		}
	}

	static async create(request, response, next) {
		try {
			const data = request.body // hook me to add something else such as user id
			const horseContributorJob = await HorseContributorJobService.create(data)
			return response.status(201).json(horseContributorJob)
		} catch (error) {
			const sqlError = new SequelizeErrorFormatter(error)
			if (sqlError) {
				return response.status(422).json(sqlError)
			}
			return next(error)
		}
	}

	static async update(request, response, next) {
		try {
			const { id } = request.params
			const data = request.body // hook me to add something else such as user id
			const horseContributorJob = await HorseContributorJobService.findOrFail(id)
			const updatedHorseContributorJob = await HorseContributorJobService.update(horseContributorJob, data)
			return response.status(201).json(updatedHorseContributorJob)
		} catch (error) {
			const sqlError = new SequelizeErrorFormatter(error)
			if (sqlError) {
				return response.status(422).json(sqlError)
			}
			return next(error)
		}
	}
}
