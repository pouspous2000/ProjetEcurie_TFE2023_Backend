export const roleLocales = {
	fr: {
		// general
		role_admin: 'admin',
		role_employee: 'employee',
		role_client: 'client',
		role_404: 'role introuvable',
		role_401: "Vous n'avez pas les permissions requises pour cette opération sur ce rôle",
		role_crud_record_unauthorized: 'impossible de modifier ce role',
		role_422_inexistingParentRole: 'Rôle parent introuvable',

		//validation
		role_sql_validation_name_unique: 'Ce nom est déjà utilisé',
		role_sql_validation_name_notEmpty: 'le champs nom doit être présent',

		role_request_validation_name_exists: 'le champs nom doit être présent',
		role_request_validation_name_length: 'le champs nom doit contenir entre 1 et 255 caractères',
		role_request_validation_parentId_isInt: 'le champs parentId doit être un nombre entier supérieur ou égal à 1',
	},
	en: {},
	nl: {},
}
