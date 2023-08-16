import { Sequelize } from 'sequelize'
import { User } from '@/modules/authentication/model'
import { Contact } from '@/modules/contact/model'
import { EventService } from '@/modules/event/service'
import { CompetitionService } from '@/modules/competition/service'
import { LessonService } from '@/modules/lesson/service'
import { TaskService } from '@/modules/task/service'
import db from '@/database'

export class EventableService {
	constructor() {
		this._eventService = new EventService()
		this._competitionService = new CompetitionService()
		this._lessonService = new LessonService()
		this._taskService = new TaskService()
	}

	async index() {
		const events = await this._eventService.index({
			include: [
				{
					model: User,
					as: 'creator',
					attributes: ['email'],
					include: {
						model: Contact,
						as: 'contact',
					},
				},
				{
					model: User,
					as: 'participants',
					attributes: ['email'],
					include: {
						model: Contact,
						as: 'contact',
					},
				},
			],
			attributes: [...Object.keys(db.models.Event.rawAttributes), [Sequelize.literal("'event'"), 'eventable']],
		})

		const competitions = await this._competitionService.index({
			include: [
				{
					model: User,
					as: 'creator',
					attributes: ['email'],
					include: {
						model: Contact,
						as: 'contact',
					},
				},
				{
					model: User,
					as: 'participants',
					attributes: ['email'],
					include: {
						model: Contact,
						as: 'contact',
					},
				},
			],
			attributes: [
				...Object.keys(db.models.Competition.rawAttributes),
				[Sequelize.literal("'competition'"), 'eventable'],
			],
		})

		const lessons = await this._lessonService.index({
			include: [
				{
					model: User,
					as: 'creator',
					include: {
						model: Contact,
						as: 'contact',
					},
				},
				{
					model: User,
					as: 'client',
					include: {
						model: Contact,
						as: 'contact',
					},
				},
			],
			attributes: [...Object.keys(db.models.Lesson.rawAttributes), [Sequelize.literal("'lesson'"), 'eventable']],
		})

		const tasks = await this._taskService.index({
			include: [
				{
					model: User,
					as: 'creator',
					include: {
						model: Contact,
						as: 'contact',
					},
				},
				{
					model: User,
					as: 'employee',
					include: {
						model: Contact,
						as: 'contact',
					},
				},
			],
			attributes: [...Object.keys(db.models.Task.rawAttributes), [Sequelize.literal("'task'"), 'eventable']],
		})

		return [...events, ...competitions, ...lessons, ...tasks]
	}
}
