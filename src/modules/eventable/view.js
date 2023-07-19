import { EventView } from '@/modules/event/views'
import { CompetitionView } from '@/modules/competition/views'
import { LessonView } from '@/modules/lesson/views'
import { TaskView } from '@/modules/task/views'

export class EventableView {
	constructor() {
		this._eventView = new EventView()
		this._competitionView = new CompetitionView()
		this._lessonView = new LessonView()
		this._taskView = new TaskView()
	}

	index(eventables) {
		return eventables.map(eventable => {
			switch (eventable.dataValues.eventable) {
				case 'event':
					return {
						eventable: 'event',
						...this._eventView.show(eventable),
					}
				case 'competition':
					return {
						eventable: 'competition',
						...this._competitionView.show(eventable),
					}
				case 'lesson':
					return {
						eventable: 'lesson',
						...this._lessonView.show(eventable),
					}
				case 'task':
					return {
						eventable: 'task',
						...this._taskView.show(eventable),
					}
				default:
					break
			}
		})
	}
}
