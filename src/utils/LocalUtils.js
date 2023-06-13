import { locales as middlewarelocales } from '@/middlewares/locales'

export class LocalUtils {
	static allLocales = [
		// add locales imports here
		{
			fr: {
				hello_world: 'Bonjour tout le monde!',
				common_404: 'Resource introuvable',
				common_error: 'Une erreur est survenue',
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
