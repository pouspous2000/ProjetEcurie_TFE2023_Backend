export const horseContributorLocales = {
	fr: {
		//errors
		horseContributor_404: 'contact introuvable',
		horseContributor_401: "Vous n'avez pas les permissions requises pour cette opération sur ce contact",

		// validation requests
		horseContributor_request_validation_firstName_exists: 'Vous devez renseigner le champs prénom',
		horseContributor_request_validation_firstName_length:
			'Le champs prénom doit comprendre entre 0 et 255 caractères',
		horseContributor_request_validation_lastName_exists: 'Vous devez renseigner le champs nom',
		horseContributor_request_validation_lastName_length: 'Le champs nom doit comprendre entre 0 et 255 caractères',
		horseContributor_request_validation_email_exists: 'Vous devez renseigner le champs email',
		horseContributor_request_validation_email_email: 'Le champs email doit être une adresse email valide',

		// validation sql
		horseContributor_sql_validation_email_unique: 'Cette adresse email est déjà utilisée par un autre contact',
		horseContributor_sql_validation_email_isEmail: 'Vous devez renseigner une adresse email valide',
	},
	en: {},
	nl: {},
}
