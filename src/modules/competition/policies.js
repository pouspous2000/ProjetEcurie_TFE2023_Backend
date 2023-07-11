export class CompetitionPolicy {
	async index(request, competitions) {
		return competitions
	}

	async show(request, competition) {
		return competition
	}
}
