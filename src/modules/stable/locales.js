export const stableLocales = {
	fr: {
		stable_404: 'Ecurie introuvable',

		stable_sql_validation_name_notEmpty: 'Le nom ne peut pas être vide',
		stable_sql_validation_vat_unique: 'Le numéro de tva doit être unique',
		stable_sql_validation_vat_isBelgianVAT: 'Schéma du numéro de tva invalide',
		stable_sql_validation_iban_format: 'Le numéro de compte IBAN fournit ne correspond pas au schéma attendu',
		stable_sql_validation_phone_unique: 'Le numéro de téléphone doit être unique',
		stable_sql_validation_email_unique: "L' adresse email doit être unique",
		stable_sql_validation_email_email: "L' adresse email doit être valide",

		stable_request_validation_name_exists: 'Le champs nom doit être présent',
		stable_request_validation_name_length: 'Le champs nom doit contenir au plus 255 caractères',
		stable_request_validation_vat_exists: 'Le champs tva doit être présent',
		stable_request_validation_vat_vat: 'Le champs tva doit être un numéro de tva belge valide',
		stable_request_validation_phone_exists: 'Le champs téléphone doit être présent',
		stable_request_validation_phone_length: 'Le champs téléphone doit contenir au plus 255 caractères',
		stable_request_validation_email_exists: 'Le champs email doit être présent',
		stable_request_validation_email_email: 'Le champs email doit être une adresse mail valide',
		stable_request_validation_invoicePrefix_length:
			'Le champs préfixe de facture doit contenir au plus 255 caractères',
		stable_request_validation_address_exists: 'Vous devez renseigner une adresse',
		stable_request_validation_address_length: 'Vous devez renseigner une adresse (min 1 caractère)',
		stable_request_validation_iban_exists: 'Vous devez renseigner un numéro iban',
		stable_request_validation_iban_format: 'Vous devez renseigner un numéro iban belge valide',
	},
	en: {
		stable_sql_validation_vat_isBelgianVAT: '',
		stable_404: '',
	},
	nl: {
		stable_sql_validation_vat_isBelgianVAT: '',
		stable_404: '',
	},
}
