export const rideLocales = {
	fr: {
		//errors
		ride_404: 'Cette sortie est introuvable',
		ride_unauthorized: "Vous n'avez pas les permissions requises pour cette sortie",

		//validation(sql)
		ride_sql_validation_price_notEmpty: 'Vous devez renseigner un prix à cette sortie',
		ride_sql_validation_price_min: "Le prix d'une sortie ne peut pas être négatif",
		ride_sql_validation_name_unique: 'Ce nom est déjà utilisé par une sortie',
		ride_sql_validation_name_notEmpty: 'Vous devez renseigner un nom à cette sortie',

		//additive_request_validation_name_exists
		ride_request_validation_name_exists: 'Vous devez renseigner un nom',
		ride_request_validation_name_isLength: "Le nom d'une sortie doit comprendre entre 1 et 255 caractères",
		ride_request_validation_period_exists: 'Vous devez renseigner une période',
		ride_request_validation_period_isIn:
			"La période doit être une des valeurs suivantes : ['WORKINGDAYS', 'WEEKEND', 'WEEK', 'DAY']",
		ride_request_validation_price_exists: 'Vous devez renseigner un prix',
		ride_request_validation_price_isDecimal: 'Vous devez renseigner un prix valide (chiffre)',
		ride_request_validation_name_isPositive: "Le prix d'une sortie doit être strictement positif",
	},
	en: {},
	nl: {},
}
