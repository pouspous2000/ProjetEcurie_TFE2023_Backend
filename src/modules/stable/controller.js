import { StableService } from '@/modules/stable/service'
import { SequelizeErrorFormatter } from '@/core/SequelizeErrorFormatter'

export class StableController {
	static async show(request, response, next) {
		const { id } = request.params
		try {
			const stable = await StableService.findOrFail(id)
			return response.status(200).json(stable)
		} catch (error) {
			return next(error)
		}
	}

	static async update(request, response, next) {
		try {
			const { id } = request.params
			const data = request.body // hook me to add something else such as user id when authentication is implemented
			const stable = await StableService.findOrFail(id)
			const updatedStable = await StableService.update(stable, data)
			return response.status(200).json(updatedStable)
		} catch (error) {
			const sqlError = new SequelizeErrorFormatter(error)
			if (sqlError) {
				return response.status(422).json(sqlError)
			}
			return next(error)
		}
	}
}
