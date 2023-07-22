export const DailyRideLocales = {
	fr: {
		dailyRide_404: 'Cette sortie journalière est introuvable',
		dailyRide_unauthorized:
			"Vous n'avez pas les permissions requises pour cette opération sur cette sortie journalière",
		dailyRide_422_delete_when_status:
			"Vous ne pouvez pas supprimer cette sortie journalière car elle est en cours d'exécution ou exécutée",

		//validation(request)
		//query parameters
		dailyRide_request_validation_query_horseId_isInt: 'Vous devez renseigner un identifiant de cheval valide',
		dailyRide_request_validation_query_horseName_isLength: 'Vous devez renseigner un nom de cheval valide',
		dailyRide_request_validation_query_taskStatus_isIn: 'Vous devez renseigner un status de tâche valide',
		dailyRide_request_validation_query_taskStartingAt_isDate:
			'Vous devez renseigner une date de début de tâche valide ISO format de YYYY-MM-DDTHH:MM:SSZ',
	},
	en: {},
	nl: {},
}
