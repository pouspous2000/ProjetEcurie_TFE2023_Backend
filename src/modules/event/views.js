export class EventView {
	constructor() {}

	index(events) {
		return events.map(event => {
			return this.show(event)
		})
	}

	show(event) {
		return {
			id: event.id,
			name: event.name,
			creator: {
				userId: event.creator.contact.userId,
				firstName: event.creator.contact.firstName,
				lastName: event.creator.contact.lastName,
				phone: event.creator.contact.phone,
				mobile: event.creator.contact.mobile,
			},
			participants: this._getParticipantView(event),
			description: event.description,
			startingAt: event.startingAt,
			endingAt: event.endingAt,
			createdAt: event.createdAt,
			updatedAt: event.updatedAt,
		}
	}

	_getParticipantView(event) {
		return event.participants.map(participant => {
			return {
				email: participant.email,
				userId: participant.contact.userId,
				firstName: participant.contact.firstName,
				lastName: participant.contact.lastName,
				phone: participant.contact.phone,
				mobile: participant.contact.mobile,
				address: participant.contact.address,
			}
		})
	}
}
