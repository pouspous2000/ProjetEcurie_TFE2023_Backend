export const ContactLocales = {
	fr: {
		//errors
		contact_404: 'Ce contact est introuvable',
		contact_401: "Vous n'avez pas les permissions requises pour ce contact",
		contact_422_inexistingUser: "L'utilisateur renseigné n'existe pas",
		contact_422_alreadyContact: "L'utilisateur renseigné possède déjà un contact",

		//validation(sql)
		contact_sql_validation_userId_isInt: 'le contact doit être associé à un utilisateur valide',
		contact_sql_validation_userId_min: 'le contact doit être associé à un utilisateur valide',
		contact_sql_validation_firstname_notEmpty: 'Le prénom ne peut pas être vide',
		contact_sql_validation_lastname_notEmpty: 'Le nom ne peut pas être vide',
		contact_sql_validation_mobile_unique: 'ce numéro de mobile est déjà utilisé',
		contact_sql_validation_address_notEmpty: 'le contact doit avoir une adresse',

		//validation(request)
		contact_request_validation_userId_exists: "vous devez renseigner l'utilisateur auquel associer le contact",
		contact_request_validation_userId_isInt: 'le champs userId doit être un entier strictement positif',
		contact_request_validation_firstName_exists: 'vous devez renseigner le champs firstName',
		contact_request_validation_firstName_length: 'le champs firstname doit contenir entre 1 et 255 caractères',
		contact_request_validation_lastName_exists: 'vous devez renseigner le champs lastName',
		contact_request_validation_lastName_length: 'le champs lastname doit contenir entre 1 et 255 caractères',
		contact_request_validation_address_exists: 'vous devez renseigner le champs address',
	},
	en: {},
	nl: {},
}
