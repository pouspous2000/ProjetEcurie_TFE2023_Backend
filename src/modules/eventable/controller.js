import { EventableService } from '@/modules/eventable/service'
import { EventablePolicy } from '@/modules/eventable/policies'
import { EventableView } from '@/modules/eventable/view'

export class EventableController {
	constructor() {
		this._service = new EventableService()
		this._policy = new EventablePolicy()
		this._view = new EventableView()
		this.index = this.index.bind(this)
	}

	async index(request, response, next) {
		try {
			const eventables = await this._policy.index(request, await this._service.index())
			return response.status(200).json(this._view.index(eventables))
		} catch (error) {
			return next(error)
		}
	}
}
