export const competitionLocales = {
	fr: {
		//errors
		competition_404: 'Compétition introuvable',
		competition_unauthorized: "Vous n'avez pas les permissions requises pour cette compétition",
		competition_422_inexistingParticipant: "Un ou plusieurs participants n'existent pas",
		competition_422_creatorSubscription:
			'En temps que créateur de de la compétition vous ne pouvez pas vous y inscrire',
		competition_422_subscriptionOnPastCompetition:
			'Impossible de changer son inscription sur une compétition passée (terminée)',

		//validation(sql)
		competition_sql_validation_creatorId_isInt: 'Vous devez renseigner un créateur valide',
		competition_sql_validation_creatorId_min: 'Vous devez renseigner un créateur valide',
		competition_sql_validation_name_notEmpty: 'Vous devez renseigner un nom',
		competition_sql_validation_description_notEmpty: 'Vous devez renseigner une description',
		competition_sql_validation_startingAt_isAfterNow: 'La compétition ne peut pas commencer dans le passé',
		competition_sql_validation_endingAt_isAfterStartingAt:
			"La compétition ne peut pas se terminer avant d'avoir commencé",

		//validation(request)
		//query parameter
		competition_request_validation_query_creatorId_isInt: 'Vous devez renseigner un créateur valide',
		competition_request_validation_query_startingAt_isDate:
			'Vous devez renseigner une date de début valide ISO format de YYYY-MM-DDTHH:MM:SSZ',
		competition_request_validation_query_endingAt_isDate:
			'Vous devez renseigner une date de fin valide ISO format de YYYY-MM-DDTHH:MM:SSZ',
		competition_request_validation_query_participants_isArray: 'Vous devez renseigner une liste de participants',
		competition_request_validation_query_participants_isPositiveInteger:
			'Vous devez renseigner des participants valides (entiers positifs)',
		//body parameter
		competition_request_validation_name_exists: 'Vous devez renseigner un nom',
		competition_request_validation_name_isLength:
			"Le nom d'une compétition doit contenir entre 1 et 255 caractères",
		competition_request_validation_description_exists: 'Vous devez renseigner une description',
		competition_request_validation_description_isLength:
			"La description d'une compétition doit contenir au minimum 1 caractère",
		competition_request_validation_startingAt_exists: 'Vous devez renseigner une date de début',
		competition_request_validation_startingAt_isDate:
			'Vous devez renseigner une date de début valide ISO format de YYYY-MM-DDTHH:MM:SSZ',
		competition_request_validation_startingAt_isAfterNow:
			"Une compétition ne peut pas commencer à une date antérieure à ajourd'hui",
		competition_request_validation_endingAt_exists: 'Vous devez renseigner une date de fin',
		competition_request_validation_endingAt_isDate:
			'Vous devez renseigner une date de fin valide ISO format de YYYY-MM-DDTHH:MM:SSZ',
		competition_request_validation_endingAt_isAfterStartingAt:
			'La date de fin de la compétition ne peut être antérieure au début de ce dernier',
		competition_request_validation_participants_exists: 'Vous devez renseigner une liste de participants',
		competition_request_validation_participants_isArray: 'Vous devez renseigner une liste valide de participants',
		competition_request_validation_participants_isPositiveInteger:
			'Vous devez renseigner une liste de participants valides',
	},
	en: {},
	nl: {},
}
