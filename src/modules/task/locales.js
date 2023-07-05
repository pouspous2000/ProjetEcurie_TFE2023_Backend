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
		task_request_validation_name_exists: 'tmp',
	},
	en: {},
	nl: {},
}
