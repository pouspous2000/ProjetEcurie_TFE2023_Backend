import { locales as middlewarelocales } from '@/middlewares/locales'
import { HorseContributorJobLocales } from '@/modules/horse-contributor-job/locales'
import { StableLocales } from '@/modules/stable/locales'
import { RoleLocales } from '@/modules/role/locales'
import { AuthenticationLocales } from '@/modules/authentication/locales'
import { PensionLocales } from '@/modules/pension/locales'
import { HorseContributorLocales } from '@/modules/horse-contributor/locales'
import { AdditiveLocales } from '@/modules/additive/locales'
import { HorseLocales } from '@/modules/horse/locales'
import { PensionDataLocales } from '@/modules/pension-data/locales'
import { AdditiveDataLocales } from '@/modules/additive-data/locales'
import { TaskLocales } from '@/modules/task/locales'
import { LessonLocales } from '@/modules/lesson/locales'
import { EventLocales } from '@/modules/event/locales'
import { CompetitionLocales } from '@/modules/competition/locales'
import { RideLocales } from '@/modules/ride/locales'
import { RideDataLocales } from '@/modules/ride-data/locales'
import { DailyRideLocales } from '@/modules/daily-ride/locales'
import { HorseContributorHorseContributorJobLocales } from '@/modules/horseContributor-horseContributorJob/locales'

export class LocalUtils {
	static allLocales = [
		// add locales imports here
		{
			fr: {
				hello_world: 'Bonjour tout le monde!',
				common_404: 'Resource introuvable',
				common_error: 'Une erreur est survenue',
				common_validation_error: 'Erreur(s) de validation',
				common_invalidId: 'Valeur invalide id',
			},
			en: {
				hello_world: 'Hello world!',
				common_404: 'Resource not found',
				common_error: 'An error has occurred',
			},
			nl: {
				hello_world: 'Hallo wereld!',
				common_404: 'Bron niet gevonden',
				common_error: 'Er is een fout opgetreden',
			},
		},
		middlewarelocales,
		HorseContributorJobLocales,
		StableLocales,
		RoleLocales,
		AuthenticationLocales,
		PensionLocales,
		HorseContributorLocales,
		AdditiveLocales,
		HorseLocales,
		PensionDataLocales,
		TaskLocales,
		AdditiveDataLocales,
		LessonLocales,
		EventLocales,
		CompetitionLocales,
		RideLocales,
		RideDataLocales,
		DailyRideLocales,
		HorseContributorHorseContributorJobLocales,
	]

	static getLocales() {
		const locales = { fr: {}, en: {}, nl: {} }
		this.allLocales.forEach(locale => {
			for (const lang in locale) {
				locales[lang] = { ...locales[lang], ...locale[lang] }
			}
		})
		return locales
	}
}
