import { middlewarelocales } from '@/middlewares/locales'
import { horseContributorJobLocales } from '@/modules/horse-contributor-job/locales'
import { stableLocales } from '@/modules/stable/locales'
import { roleLocales } from '@/modules/role/locales'
import { authenticationLocales } from '@/modules/authentication/locales'
import { pensionLocales } from '@/modules/pension/locales'
import { horseContributorLocales } from '@/modules/horse-contributor/locales'
import { additiveLocales } from '@/modules/additive/locales'
import { horseLocales } from '@/modules/horse/locales'
import { pensionDataLocales } from '@/modules/pension-data/locales'
import { additiveDataLocales } from '@/modules/additive-data/locales'
import { taskLocales } from '@/modules/task/locales'
import { lessonLocales } from '@/modules/lesson/locales'
import { eventLocales } from '@/modules/event/locales'
import { competitionLocales } from '@/modules/competition/locales'
import { rideLocales } from '@/modules/ride/locales'
import { rideDataLocales } from '@/modules/ride-data/locales'
import { dailyRideLocales } from '@/modules/daily-ride/locales'
import { horseContributorHorseContributorJobLocales } from '@/modules/horseContributor-horseContributorJob/locales'

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
		horseContributorJobLocales,
		stableLocales,
		roleLocales,
		authenticationLocales,
		pensionLocales,
		horseContributorLocales,
		additiveLocales,
		horseLocales,
		pensionDataLocales,
		taskLocales,
		additiveDataLocales,
		lessonLocales,
		eventLocales,
		competitionLocales,
		rideLocales,
		rideDataLocales,
		dailyRideLocales,
		horseContributorHorseContributorJobLocales,
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
