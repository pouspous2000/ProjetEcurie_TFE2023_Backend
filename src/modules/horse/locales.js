export const horseLocales = {
	fr: {
		//errors
		horse_404: 'Ce cheval est introuvable',
		horse_401: "Vous n'avez pas les permissions requises pour ce cheval",
		horse_unauthorized_change_ownerId:
			'Vous ne pouvez pas changer le propriétaire du cheval, veuillez demander à un employé ou administrateur',
		horse_422_inexistingOwner: "Le propriétaire renseigné n'existe pas",
		horse_422_inexistingPension: "La pension renseignée n'existe pas",
		horse_422_inexistingRide: "La sortie renseignée n'existe pas",
		horse_422_inexistingHorseman: "Un ou plusieurs cavaliers n'existent pas",

		//validation(sql)
		horse_sql_validation_ownerId_isInt:
			'Vous devez renseigner un propriétaire valide (id entier strictrement positif)',
		horse_sql_validation_ownerId_min:
			'Vous devez renseigner un propriétaire valide (id entier strictrement positif)',
		horse_sql_validation_pensionId_isInt: 'Vous devez renseigner une pension valid (id entier strictement positif)',
		horse_sql_validation_pensionId_min: 'Vous devez renseigner une pension valid (id entier strictement positif)',
		horse_sql_validation_name_notEmpty: 'Vous devez renseigner un nom valide au cheval : il ne peut pas être vide',

		//validation(request)
		horse_request_validation_ownerId_exists: 'Vous devez renseigner le propriétaire du cheval',
		horse_request_validation_ownerId_isInt: 'Vous devez renseigner un propriétaire valide',
		horse_request_validation_pensionId_exists: 'Vous devez renseigner une pension au cheval',
		horse_request_validation_pensionId_isInt: 'Vous devez renseigner une pension valide',
		horse_request_validation_rideId_isInt: 'Vous devez renseigner une sortie valide',
		horse_request_validation_name_exists: 'Vous devez renseigner un nom',
		horse_request_validation_name_length: 'Le nom du cheval doit contenir entre 1 et 255 caractères',
		horse_request_validation_comment_exists: 'Vous devez renseigner un commentaire',
		horse_request_validation_horsemen_exists: 'Vous devez renseigner au moins un cavalier',
		horse_request_validation_horsemen_isArray: 'Vous devez renseigner au moins un cavalier',
		horse_request_validation_horsemen_horseman_isPositiveInteger: 'Vous devez renseigner des cavaliers existants',
	},
	en: {},
	nl: {},
}
