import i18next from '../../i18n'

export class DateUtils {
	static isCorrectFormat(value, errorMessage) {
		if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
			throw new Error(i18next.t(errorMessage))
		}
		return true
	}

	static getFirstDayOfLastMonth() {
		const today = new Date()

		const referenceDate = new Date(today)
		let previousMonth = referenceDate.getMonth() - 1
		let year = referenceDate.getFullYear()

		if (previousMonth < 0) {
			previousMonth = 11
			year--
		}
		return new Date(year, previousMonth, 1)
	}

	static getLastDateOfLastMonth() {
		const today = new Date()
		const firstDayOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
		const lastDayOfLastMonth = new Date(firstDayOfThisMonth)
		lastDayOfLastMonth.setDate(lastDayOfLastMonth.getDate() - 1)

		lastDayOfLastMonth.setHours(23)
		lastDayOfLastMonth.setMinutes(59)
		lastDayOfLastMonth.setSeconds(59)
		lastDayOfLastMonth.setMilliseconds(999)
		return lastDayOfLastMonth
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
