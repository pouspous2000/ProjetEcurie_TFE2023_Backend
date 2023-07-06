export const LessonLocales = {
	fr: {
		// errors
		lesson_404: 'Leçon trouvable',
		lesson_unauthorized: "Vous n'avez pas les permissions requises pour cette leçon",

		// validation (sql)
		lesson_sql_validation_creatorId_isInt: 'Vous devez renseigner un créateur valide',
		lesson_sql_validation_creatorId_min: 'Vous devez renseigner un créateur valide',
		lesson_sql_validation_clientId_isInt: 'Vous devez renseigner un client valide',
		lesson_sql_validation_clientId_min: 'Vous devez renseigner un client valide',
		lesson_sql_validation_startingAt_isAfterNow: 'La leçon ne peut commencer avant maintenant',
		lesson_sql_validation_endingAt_isAfterStartingAt:
			'La fin de la leçon ne peut être antérieure au debut de cette dernière',

		// validation (request)
		// query parameters
		lesson_request_validation_query_creatorId_isInt: 'Vous devez renseigner un créateur valide',
		lesson_request_validation_query_clientId_isInt: 'Vous devez renseigner un client valide',
		lesson_request_validation_query_startingAt_isDate: 'Vous devez renseigner une date de début valide',
		lesson_requests_validation_query_status_isIn: 'Vous devez renseigner un status valide',
	},
	en: {},
	nl: {},
}
