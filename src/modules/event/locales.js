export const EventLocales = {
	fr: {
		//errors
		event_404: 'Evénement introuvable',
		event_unauthorized: "Vous n'avez pas les permissions requises pour cet événement",
		event_422_inexistingParticipant: "Un ou plusieurs participants n'existent pas",
		event_422_creatorSubscription: "En temps que créateur de l'événement vous ne pouvez pas vous y inscrire",
		event_422_subscriptionOnPastEvent: 'Impossible de changer son inscription sur un événement passé',

		//validation(sql)
		event_sql_validation_creatorId_isInt: 'Vous devez renseigner un créateur valide',
		event_sql_validation_creatorId_min: 'Vous devez renseigner un créateur valide',
		event_sql_validation_name_notEmpty: 'Vous devez renseigner un nom',
		event_sql_validation_description_notEmpty: 'Vous devez renseigner une description',
		event_sql_validation_startingAt_isAfterNow: "L'événement ne peut pas commencer dans le passé",
		event_sql_validation_endingAt_isAfterStartingAt: "L'événement ne peut pas se terminer avant d'avoir commencé",

		//validation(request)
		//query parameter
		event_request_validation_query_creatorId_isInt: 'Vous devez renseigner un créateur valide',
		event_request_validation_query_startingAt_isDate:
			'Vous devez renseigner une date de début valide ISO format de YYYY-MM-DDTHH:MM:SSZ',
		event_request_validation_query_endingAt_isDate:
			'Vous devez renseigner une date de fin valide ISO format de YYYY-MM-DDTHH:MM:SSZ',
		event_request_validation_query_participants_isArray: 'Vous devez renseigner une liste de participants',
		event_request_validation_query_participants_isPositiveInteger:
			'Vous devez renseigner des participants valides (entiers positifs)',

		//body parameter
		event_request_validation_name_exists: 'Vous devez renseigner un nom',
		event_request_validation_name_isLength: "Le nom d'un événement doit contenir entre 1 et 255 caractères",
		event_request_validation_description_exists: 'Vous devez renseigner une description',
		event_request_validation_description_isLength:
			"La description d'un événement doit contenir au minimum 1 caractère",
		event_request_validation_startingAt_exists: 'Vous devez renseigner une date de début',
		event_request_validation_startingAt_isDate:
			'Vous devez renseigner une date de début valide ISO format de YYYY-MM-DDTHH:MM:SSZ',
		event_request_validation_startingAt_isAfterNow:
			"Un événement ne peut pas commencer à une date antérieure à ajourd'hui",
		event_request_validation_endingAt_exists: 'Vous devez renseigner une date de fin',
		event_request_validation_endingAt_isDate:
			'Vous devez renseigner une date de fin valide ISO format de YYYY-MM-DDTHH:MM:SSZ',
		event_request_validation_endingAt_isAfterStartingAt:
			"La date de fin de l'événement ne peut être antérieure au début de ce dernier",
		event_request_validation_participants_exists: 'Vous devez renseigner une liste de participants',
		event_request_validation_participants_isArray: 'Vous devez renseigner une liste valide de participants',
		event_request_validation_participants_isPositiveInteger:
			'Vous devez renseigner une liste de participants valides',
	},
	en: {},
	nl: {},
}
