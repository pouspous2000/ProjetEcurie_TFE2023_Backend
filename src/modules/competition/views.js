export class CompetitionView {
	constructor() {}

	index(competitions) {
		return competitions.map(competition => {
			return this.show(competition)
		})
	}

	show(competition) {
		return {
			id: competition.id,
			name: competition.name,
			creator: {
				userId: competition.creator.contact.userId,
				firstName: competition.creator.contact.firstName,
				lastName: competition.creator.contact.lastName,
				phone: competition.creator.contact.phone,
				mobile: competition.creator.contact.mobile,
			},
			participants: this._getParticipantView(competition),
			description: competition.description,
			startingAt: competition.startingAt,
			endingAt: competition.endingAt,
			createdAt: competition.createdAt,
			updatedAt: competition.updatedAt,
		}
	}

	create(competition) {
		return this.show(competition)
	}

	update(competition) {
		return this.show(competition)
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
