import { StableService } from '@/modules/stable/service'

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
}
