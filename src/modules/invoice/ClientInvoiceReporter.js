import { Op } from 'sequelize'
import { DateUtils } from '@/utils/DateUtils'
import db from '@/database'
import { Task } from '@/modules/task/model'

export class HorseInvoiceReporter {
	constructor(horse) {
		this._startingAt = DateUtils.getFirstDayOfLastMonth()
		this._endingAt = DateUtils.getLastDateOfLastMonth()
		this._horse = horse
		this._totalPriceVatExcluded = 0.0
		this._totalPriceVatIncluded = 0.0
		this._pensionDataReport = [] // [{name, monthlyPrice, nbDays, price}]
		this._additiveDataReport = [] // [{id, name, price}]
		this._dailyRideReport = [] // [{id, name, price}]
		this._rideDataReport = [] // [{name, monthlyPrice, nbDays, price}]
		this._additiveDatasToUpdate = []
	}

	get totalPriceVatExcluded() {
		return this._totalPriceVatExcluded
	}

	get totalPriceVatIncluded() {
		return this._totalPriceVatIncluded
	}

	get additiveDatasToUpdate() {
		return this._additiveDatasToUpdate
	}

	get pensionDatasReport() {
		return this._pensionDataReport
	}

	get additiveDatasReport() {
		return this._additiveDataReport
	}

	get dailyRidesReport() {
		return this._dailyRideReport
	}

	get rideDatasReport() {
		return this._rideDataReport
	}

	get horse() {
		return this._horse
	}

	async getReport() {
		await this._getPensionDataReport()
		await this._getAdditiveDataReport()
		await this._getDailyRideReport()
		await this._getRideDataReport()

		for (const reports of [
			this._pensionDataReport,
			this._additiveDataReport,
			this._dailyRideReport,
			this._rideDataReport,
		]) {
			reports.forEach(report => {
				this._totalPriceVatExcluded += Number(report.price)
			})
		}

		this._totalPriceVatIncluded = this._totalPriceVatExcluded * 1.21
	}

	async _getPensionDataReport() {
		const pensionDatas = await db.models.PensionData.findAll({
			where: {
				horseId: this._horse.id,
				createdAt: {
					[Op.between]: [this._startingAt, this._endingAt],
				},
			},
			order: [['id', 'ASC']],
			paranoid: false,
		})

		if (pensionDatas && pensionDatas.length) {
			// if pensionDatas in lastMonth
			if (pensionDatas[0].createdAt.getDate() !== 1) {
				// changed of pension during the month but the previous pension is not created this month and was therefore excluded from the query
				const previousPensionData = await db.models.PensionData.findOne({
					where: {
						horseId: this._horse.id,
						id: {
							[Op.lt]: pensionDatas[0].id,
						},
					},
					order: [['id', 'DESC']],
					paranoid: false,
				})

				const pensionDataReport = {
					name: previousPensionData.name,
					monthlyPrice: previousPensionData.monthlyPrice,
				}
				pensionDataReport.nbDays = DateUtils.getNbDaysBetween2Dates(pensionDatas[0].createdAt, this._startingAt)
				const nbOfDaysOfMonth = DateUtils.getNbDaysOfMonthFromDate(previousPensionData.deletedAt)
				const dailyPrice = pensionDataReport.monthlyPrice / nbOfDaysOfMonth
				pensionDataReport.price = dailyPrice * pensionDataReport.nbDays
				this._pensionDataReport.push(pensionDataReport)
			}

			pensionDatas.forEach(pensionData => {
				const pensionDataReport = {
					name: pensionData.name,
					monthlyPrice: pensionData.monthlyPrice,
				}
				if (pensionData.deletedAt) {
					pensionDataReport.nbDays = DateUtils.getNbDaysBetween2Dates(
						pensionData.deletedAt,
						pensionData.createdAt
					)
				} else {
					pensionDataReport.nbDays = DateUtils.getNbDaysBetween2Dates(this._endingAt, pensionData.createdAt)
				}
				const nbOfDaysOfMonth = DateUtils.getNbDaysOfMonthFromDate(pensionData.createdAt)
				const dailyPrice = pensionDataReport.monthlyPrice / nbOfDaysOfMonth
				pensionDataReport.price =
					pensionDataReport.nbDays === nbOfDaysOfMonth
						? pensionData.monthlyPrice
						: dailyPrice * pensionDataReport.nbDays

				this._pensionDataReport.push(pensionDataReport)
			})
		} else {
			const lastPensionDataNotDeleted = await db.models.PensionData.findOne({
				where: {
					horseId: this._horse.id,
				},
				order: [['id', 'DESC']],
			})

			// then we can take the monthly price , the nbDays is not pertinent here but we will skip it later
			this._pensionDataReport.push({
				name: lastPensionDataNotDeleted.name,
				monthlyPrice: lastPensionDataNotDeleted.monthlyPrice,
				nbDays: DateUtils.getNbDaysOfMonthFromDate(this._startingAt),
				price: lastPensionDataNotDeleted.monthlyPrice,
			})
		}
	}

	async _getAdditiveDataReport() {
		const additiveDatas = await db.models.AdditiveData.findAll({
			where: {
				horseId: this._horse.id,
				createdAt: {
					[Op.between]: [this._startingAt, this._endingAt],
				},
				status: 'ACTIVE',
			},
		})

		additiveDatas.forEach(additiveData => {
			this._additiveDataReport.push({
				id: additiveData.id,
				name: additiveData.name,
				price: additiveData.price,
			})
			this._additiveDatasToUpdate.push(additiveData.id)
		})
	}

	async _getDailyRideReport() {
		const dailyRides = await db.models.DailyRide.findAll({
			include: [
				{
					model: Task,
					as: 'task',
				},
			],
			where: {
				horseId: this._horse.id,
				'$task.status$': 'COMPLETED',
				'$task.updatedAt$': {
					[Op.between]: [this._startingAt, this._endingAt],
				},
			},
		})

		dailyRides.forEach(dailyRide => {
			this._dailyRideReport.push({
				id: dailyRide.id,
				name: dailyRide.name,
				price: dailyRide.price,
			})
		})
	}

	async _getRideDataReport() {
		const rideDatas = await db.models.RideData.findAll({
			where: {
				horseId: this._horse.id,
				createdAt: {
					[Op.between]: [this._startingAt, this._endingAt],
				},
			},
			paranoid: false,
		})

		if (rideDatas && rideDatas.length) {
			// if rideDatas in lastMonth
			rideDatas.forEach(rideData => {
				const rideDataReport = {
					name: rideData.name,
					monthlyPrice: rideData.price,
				}
				if (rideData.deletedAt) {
					rideDataReport.nbDays = DateUtils.getNbDaysBetween2Dates(rideData.deletedAt, rideData.createdAt)
				} else {
					rideDataReport.nbDays = DateUtils.getNbDaysBetween2Dates(this._endingAt, rideData.createdAt)
				}
				const nbOfDaysOfMonth = DateUtils.getNbDaysOfMonthFromDate(rideData.createdAt)
				const dailyPrice = rideDataReport.monthlyPrice / nbOfDaysOfMonth
				rideDataReport.price =
					rideDataReport.nbDays === nbOfDaysOfMonth ? rideData.price : dailyPrice * rideDataReport.nbDays

				this._rideDataReport.push(rideDataReport)
			})
		} else {
			//if no ride data last month -> get last ride informations
			const lastRideDataNotDeleted = await db.models.RideData.findOne({
				where: {
					horseId: this._horse.id,
				},
				order: [['id', 'DESC']],
			})

			if (!lastRideDataNotDeleted) {
				// no rideData found , nothing to do
			} else {
				// then we can take the monthly price , the nbDays is not pertinent here but we will skip it later, monthly price = price
				this._rideDataReport.push({
					name: lastRideDataNotDeleted.name,
					monthlyPrice: lastRideDataNotDeleted.price,
					nbDays: DateUtils.getNbDaysOfMonthFromDate(this._startingAt),
					price: lastRideDataNotDeleted.price,
				})
			}
		}
	}
}
