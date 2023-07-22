export const DailyRideLocales = {
	fr: {
		dailyRide_404: 'Cette sortie journalière est introuvable',
		dailyRide_unauthorized:
			"Vous n'avez pas les permissions requises pour cette opération sur cette sortie journalière",
		dailyRide_422_delete_when_status:
			"Vous ne pouvez pas supprimer cette sortie journalière car elle est en cours d'exécution ou exécutée",
		dailyRide_422_inexistingRideDay: 'Impossible de trouver une sortie de type "Journalier"',
		dailyRide_422_inexistingHorse: 'Imposible de trouver le cheval auquel ajouter la sortie journalière',
		dailyRide_422_inexistingAdminUser:
			'Impossible de trouver un administrateur auquel affecter la tâche de sortie journalière',

		dailyRide: 'Sortie journalière',

		//validation(request)
		//query parameters
		dailyRide_request_validation_query_horseId_isInt: 'Vous devez renseigner un identifiant de cheval valide',
		dailyRide_request_validation_query_horseName_isLength: 'Vous devez renseigner un nom de cheval valide',
		dailyRide_request_validation_query_taskStatus_isIn: 'Vous devez renseigner un status de tâche valide',
		dailyRide_request_validation_query_taskStartingAt_isDate:
			'Vous devez renseigner une date de début de tâche valide ISO format de YYYY-MM-DDTHH:MM:SSZ',
		//body parameters
		dailyRide_request_validation_horseId_exists: 'Vous devez renseigner un cheval',
		dailyRide_request_validation_horseId_isInt: 'Vous devez renseigner un cheval valide',
		dailyRide_request_validation_task_isObject: 'Vous devez renseigner une tâche',
		dailyRide_request_validation_task_notEmpty: 'Vous devez renseigner une tâche',
		dailyRide_request_validation_taskStartingAt_notEmpty:
			'Vous devez renseigner une date de début pour la sortie journalière',
		dailyRide_request_validation_taskStartingAt_isDate:
			'Vous devez renseigner une date de début au format ISO YYYY-MM-DDTHH:MM:SSZ',
		dailyRide_request_validation_taskStartingAt_isBeforeNow:
			'La sortie journalière ne peut être antérieure à maintenant',
		dailyRide_request_validation_taskRemark_isLength: 'Vous devez renseigner une remarque valide',
	},
	en: {},
	nl: {},
}
