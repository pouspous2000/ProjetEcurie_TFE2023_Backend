import { BaseService } from '@/core/BaseService'
import { Lesson } from '@/modules/lesson/model'

export class LessonService extends BaseService {
	constructor() {
		super(Lesson.getModelName(), 'lesson_404')
	}
}
