import i18next from 'i18next'
import { LocalUtils } from '@/utils/LocalUtils'

const locales = LocalUtils.getLocales()

i18next.init({
	resources: {
		fr: {
			translation: locales.fr,
		},
		en: {
			translation: locales.en,
		},
		nl: {
			translation: locales.nl,
		},
	},
	lng: 'fr',
	fallbackLng: 'fr',
	interpolation: {
		escapeValue: true,
	},
})

export default i18next
