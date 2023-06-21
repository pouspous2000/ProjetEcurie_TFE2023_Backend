export const AuthenticationLocales = {
	fr: {
		authentication_404: 'Utilisateur introuvable',

		// validation
		authentication_sql_validation_email_unique: 'Cette adresse email est déjà utilisée',
		authentication_sql_validation_email_isEmail: 'Adresse email invalide',
		authentication_sql_validation_confirmationCode_unique: 'Ce code de confirmation est déjà utilisé',

		authentication_request_validation_password_exists: 'Vous devez entrer un mot de passe',
		authentication_request_validation_passwordConfirm_exists: 'Vous devez entrer une confirmation du mot de passe',
		authentication_request_validation_passwordConfirm_custom: 'Les mots de passe douvent correspondre',
		authentication_request_validation_email_exists: 'Le champs email doit être présent',
		authentication_request_validation_email_isEmail: 'Le champs email doit être une adresse email valide',

		//register
		authentication_register_message: 'Vous avez reçu un email de confirmation de création du compte',
		authentication_confirm_message: 'Confirmation de votre compte',
		authentication_already_confirmed: 'Ce compte a déjà été confirmé',

		// login
		authentication_login_password_invalid: 'Mot de passe incorrect',
		authentication_login_user_unconfirmed: 'Veuillez confirmer votre compte',
	},
	en: {},
	nl: {},
}
