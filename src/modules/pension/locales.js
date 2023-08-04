export const pensionLocales = {
	fr: {
		//errors
		pension_404: 'Cette pension est introuvable',
		pension_422_cannotDeletePension:
			"Vous ne pouvez pas supprimer cette pension car un ou plusieurs chevaux l'utilisent actuellement",
		pension_unauthorized: "Vous n'avez pas les permissions requises pour cette opération sur cette pension",

		//validation(sql)
		pension_sql_validation_name_unique: 'Ce nom est déjà utilisé par une autre pension',
		pension_sql_validation_name_notEmpty: 'Le nom ne peut pas être vide',
		pension_sql_validation_monthlyPrice_notEmpty: 'le prix mensuel ne peut pas être vide',
		pension_sql_validation_monthlyPrice_min: 'le prix mensuel doit être strictement positif',

		//validation(request)
		pension_request_validation_name_exists: 'Vous devez renseigner le champs nom',
		pension_request_validation_name_length:
			'Le nom de la pension doit avoir un nombre de caractères compris entre 1 et 255',
		pension_request_validation_monthlyPrice_exists: 'Vous devez renseigner le prix mensuel',
		pension_request_validation_monthlyPrice_decimal: 'Le prix mensuel doit être un nombre décimal supérieur à 0.00',
		pension_request_validation_description_exists: 'Vous devez renseigner le champs description',
	},
	en: {},
	nl: {},
}
