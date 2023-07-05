export const TaskLocales = {
	fr: {
		//errors
		task_404: 'Tâche introuvable',
		task_unauthorized: "Vous n'avez pas les permissions requises pour cette tâche",
		task_unauthorized_employee_updateStatus:
			'Vous ne pouvez changer le status que vers les etats suivants : Confirmé, En cours, Terminé, Bloqué',
		task_unauthorized_employee_updateField:
			'Vous ne pouvez changer que le status de la tâche ainsi que ses remarques éventuellemes',

		// model (enum)
		task_status_enum_PENDING: 'En attente de confirmation',
		task_status_enum_CONFIRMED: 'Confirmé',
		task_status_enum_IN_PROGRESS: 'En cours',
		task_status_enum_COMPLETED: 'Terminé',
		task_status_enum_BLOCKED: 'Bloqué',
		task_status_enum_CANCELLED: 'Annulé',

		//validation(sql)
		task_sql_validation_creatorId_isInt: 'Vous devez renseigner un createur valide',
		task_sql_validation_creatorId_min: 'Vous devez renseigner un createur valide',
		task_sql_validation_employeeId_isInt: 'Vous devez renseigner un employé valide',
		task_sql_validation_employeeId_min: 'Vous devez renseigner un employé valide',
		task_sql_validation_name_notEmpty: 'Vous devez donner un nom à la tâche',
		task_sql_validation_description_notEmpty: 'Vous devez donner une description à la tâche',
		task_sql_validation_startingAt_isAfterNow: 'La tâche ne peut pas commencer avant maintenant',
		task_sql_validation_endingAt_isAfterStartingAt: "La tâch ne peut pas se terminer avant d'avoir commencé",

		//validation(request)
		//query parameters
		task_request_validation_query_employeeId_isInt: 'Vous devez renseigner un employé valide',
		task_request_validation_query_creatorId_isInt: 'Vous devez renseigner un créateur valide',
		task_request_validation_query_startingAt_isDate:
			'Vous devez renseigner une date de début valide ISO format de YYYY-MM-DDTHH:MM:SSZ',
		task_request_validation_query_status_isIn: 'Vous devez renseigner un status valide',
		//body request
		task_request_validation_employeeId_exists: 'Vous devez renseigner un employé',
		task_request_validation_employeeId_isInt: 'Vous devez renseigner un employé valide',
		task_request_validation_name_exists: 'Vous devez renseigner un nom',
		task_request_validation_name_isLength: 'Le nom de la tâche doit contenir entre 1 et 255 caractères',
		task_request_validation_description_exists: 'Vous devez renseigner une description',
		task_request_validation_description_isLength: 'Vous devez renseigner une description',
		task_request_validation_startingAt_exists: 'Vous devez renseigner une date de début',
		task_request_validation_startingAt_isDate:
			'Vous devez renseigner une date de début valid au format ISO YYYY-MM-DDTHH:MM:SSZ',
		task_request_validation_endingAt_exists: 'Vous devez renseigner une date de fin',
		task_request_validation_endingAt_isDate:
			'Vous devez renseigner une date de début valid au format ISO YYYY-MM-DDTHH:MM:SSZ',
		task_request_validation_endingAt_isAfterStartingAt:
			'La date de fin ne peut pas être antérieur à la date de début',
	},
	en: {},
	nl: {},
}
