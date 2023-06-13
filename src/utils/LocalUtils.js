export class LocalUtils {
	static allLocales = [
		// add locales imports here
		{
			fr: {
				hello_world: 'Bonjour tout le monde!',
			},
			en: {
				hello_world: 'Hello world!',
			},
			nl: {
				hello_world: 'hallo wereld!',
			},
		},
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
