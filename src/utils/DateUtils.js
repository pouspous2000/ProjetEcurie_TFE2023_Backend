import i18next from '../../i18n'

export class DateUtils {
	static isCorrectFormat(value, errorMessage) {
		if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
			throw new Error(i18next.t(errorMessage))
		}
		return true
	}
}
