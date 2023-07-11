export const CompetitionLocales = {
	fr: {
		//errors
		competition_404: 'Compétition introuvable',
		competition_unauthorized: "Vous n'avez pas les permissions requises pour cette compétition",
		competition_422_inexistingParticipant: "Un ou plusieurs participants n'existent pas",
		competition_422_creatorSubscription:
			'En temps que créateur de de la compétition vous ne pouvez pas vous y inscrire',
		competition_422_subscriptionOnPastEvent:
			'Impossible de changer son inscription sur une compétition passée (terminée)',

		//validation(sql)
		competition_sql_validation_creatorId_isInt: 'Vous devez renseigner un créateur valide',
		competition_sql_validation_creatorId_min: 'Vous devez renseigner un créateur valide',
		competition_sql_validation_name_notEmpty: 'Vous devez renseigner un nom',
		competition_sql_validation_description_notEmpty: 'Vous devez renseigner une description',
		competition_sql_validation_startingAt_isAfterNow: 'La compétition ne peut pas commencer dans le passé',
		competition_sql_validation_endingAt_isAfterStartingAt:
			"La compétition ne peut pas se terminer avant d'avoir commencé",
	},
	en: {},
	nl: {},
}
