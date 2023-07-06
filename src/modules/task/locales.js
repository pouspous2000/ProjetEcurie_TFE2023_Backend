export const TaskLocales = {
	fr: {
		//errors
		task_404: 'Tâche introuvable',
		task_unauthorized: "Vous n'avez pas les permissions requises pour cette tâche",
		task_unauthorized_employee_updateField:
			'Vous ne pouvez changer que le status de la tâche ainsi que ses remarques éventuelles',
		task_401_update_admin_status: 'Le créateur de la tâche ne peut changer le status que vers annulé',
		task_401_update_admin_field_when_status: 'Le créateur de la tâche ne peut pas changer la tâche avec ce status',
		task_422_update_completedOrCancelled: 'Vous ne pouvez pas modifier une tâche terminée ou annulée',
		task_422_update_employee_fromPending_toConfirmed:
			'Vous ne pouvez le status de "en attente de confirmation" que vers "confirmé"',
		task_422_update_employee_fromConfirmed_toInProgressOrBlocked:
			'Si le status est confirmé vous ne pouvez passer que à en cours ou bloqué',
		task_422_update_employee_fromInProgress_toCompletedOrBlocked:
			'Si le status est en cours on ne peut passer que à complété ou bloqué',
		task_422_update_employee_fromBlocked_toInProgress: 'Si le status est bloqué on ne peut aller que vers en cours',

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
		task_request_validation_remark_exists: 'Vous devez renseigner le champs remarque',
		task_request_validation_status_exists: 'Vous devez renseigner le champs status',
		task_request_validation_creatorId_exists: 'Vous devez renseigner un créateur',
		task_request_validation_creatorId_isInt: 'Vous devez renseigner un créateur valide',
	},
	en: {},
	nl: {},
}
