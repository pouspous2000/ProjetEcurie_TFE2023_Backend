import { BaseService } from '@/core/BaseService'
import { Event } from '@/modules/event/model'

export class EventService extends BaseService {
	constructor() {
		super(Event.getModelName(), 'event_404')
	}
}
