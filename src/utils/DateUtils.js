import i18next from '../../i18n'

export class DateUtils {
	static isCorrectFormat(value, errorMessage) {
		if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
			throw new Error(i18next.t(errorMessage))
		}
		return true
	}

	static getFirstDayOfThisMonth(referenceDate) {
		const date = new Date(referenceDate)
		return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0))
	}

	static getLastDayOfThisMonth(referenceDate) {
		const date = new Date(referenceDate)
		return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999))
	}

	static getFirstDayOfPreviousMonth(referenceDate) {
		const date = new Date(referenceDate)

		let year = date.getUTCFullYear()
		let previousMonth = date.getUTCMonth() - 1

		if (previousMonth < 0) {
			previousMonth = 11
			year--
		}

		return new Date(Date.UTC(year, previousMonth, 1, 0, 0, 0, 0))
	}

	static getLastDayOfPreviousMonth(referenceDate) {
		const date = new Date(referenceDate)
		return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 0, 23, 59, 59, 999))
	}

	static getNbDaysBetween2Dates(afterDate, beforeDate) {
		if (afterDate <= beforeDate) {
			throw new Error('Invalid args afterDay is not <= beforeDate')
		}

		const durationInMs = afterDate - beforeDate
		return Math.round(durationInMs / (1000 * 60 * 60 * 24))
	}

	static getNbDaysOfMonthFromDate(referenceDate) {
		const date = new Date(referenceDate)

		date.setDate(1) //first of the month
		date.setMonth(date.getMonth() + 1) //next month
		date.setDate(date.getDate() - 1) //get last day of reference month
		return date.getDate() //get nb of days of reference month
	}
}
