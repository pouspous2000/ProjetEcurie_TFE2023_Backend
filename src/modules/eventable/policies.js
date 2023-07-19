export class EventablePolicy {
	async index(request, eventables) {
		switch (request.user.roleCategory) {
			case 'ADMIN':
				return eventables
			case 'EMPLOYEE':
				return eventables.filter(eventable => {
					switch (eventable.eventable) {
						case 'event':
							return true
						case 'competition':
							return true
						case 'lesson':
							return eventable.creatorId === request.user.id
						case 'task':
							return eventable.employeeId === request.user.id
						default:
							return false
					}
				})
			case 'CLIENT':
				return eventables.filter(eventable => {
					switch (eventable.eventable) {
						case 'event':
							return true
						case 'competition':
							return true
						case 'lesson':
							return eventable.clientId === request.user.id
						case 'task':
							return false
						default:
							return false
					}
				})
		}
	}
}
