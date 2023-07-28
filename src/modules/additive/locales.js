export const additiveLocales = {
	fr: {
		//errors
		additive_404: 'Cet additif est introuvable',
		additive_unauthorized: "Vous n'avez pas les permissions requises pour cet additif",

		//validation(sql)
		additive_sql_validation_name_unique: 'Le nom est déjà utilisé par un autre additif',
		additive_sql_validation_name_notNull: 'Le nom ne peut être vide',
		additive_sql_validation_price_notNull: 'Le prix ne peut être vide',

		//validation(request)
		additive_request_validation_name_exists: 'Vous devez renseigner le champs nom',
		additive_request_validation_name_length: 'Le champs nom doit contenir entre 1 et 255 caractères',
		additive_request_validation_price_exists: 'Vous devez renseigner le champs prix',
		additive_request_validation_price_decimal: 'Le champs prix doit contenir un nombre',
	},
	en: {},
	nl: {},
}
