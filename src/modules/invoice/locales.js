export const invoiceLocales = {
	fr: {
		invoice_404: 'La facture demandée est introuvable',
		invoice_401: "Vous n'avez pas les permissions requises pour cette opération sur cette facture",
		invoice_422_invalidPdf: 'le fichier fourni n’est pas un pdf valide',
		aws_404: 'la clef demandée est introuvable',

		//sql
		invoice_sql_validation_number_min: 'Le numéro de facture ne peut pas être négatif',
		invoice_sql_validation_price_min: "Le montant d'une facture ne peut pas être négatif",
		invoice_sql_validation_dueDate_isAfterNow: "La date d'échéance ne peut pas être antérieure à ajourd'hui",

		//request validation
		//query params
		invoice_request_validation_query_status_isIn:
			'Le status de la factures est invalides, valeurs acceptées UNPAID, PAID',
		invoice_request_validation_query_clientId_isInt:
			"Le client n'est pas valide, veuillez entrer une valeur entière strictement positive",
		invoice_request_validation_query_cronStatus_isIn:
			"Le status du cron n'est pas valide : valeurs acceptées DONE, FAILED",
		invoice_request_validation_query_year_isInt: 'Veuillez entrer une année valide',
		invoice_request_validation_query_month_isInt:
			'Veuillez entrer un mois valide, valeurs acceptées de 0 à 11 inclus',
	},
	en: {},
	nl: {},
}
