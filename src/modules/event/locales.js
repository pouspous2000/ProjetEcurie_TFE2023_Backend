export const EventLocales = {
	fr: {
		//errors
		event_404: 'Evénement introuvable',
		event_unauthorized: "Vous n'avez pas les permissions requises pour cet événement",

		//validation(sql)
		event_sql_validation_creatorId_isInt: 'Vous devez renseigner un créateur valide',
		event_sql_validation_creatorId_min: 'Vous devez renseigner un créateur valide',
		event_sql_validation_name_notEmpty: 'Vous devez renseigner un nom',
		event_sql_validation_description_notEmpty: 'Vous devez renseigner une description',
		event_sql_validation_startingAt_isAfterNow: "L'événement ne peut pas commencer dans le passé",
		event_sql_validation_endingAt_isAfterStartingAt: "L'événement ne peut pas se terminer avant d'avoir commencé",

		//validation(request)
	},
	en: {},
	nl: {},
}
