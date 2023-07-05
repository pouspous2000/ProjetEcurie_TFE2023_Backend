export const TaskLocales = {
	fr: {
		//errors
		task_404: 'Tâche introuvable',
		task_unauthorized: "Vous n'avez pas les permissions requises pour cette tâche",

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
