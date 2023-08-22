import path from 'path'
import { readFile } from 'fs/promises'
import handlebars from 'handlebars'
import { Op } from 'sequelize'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { PassThrough } from 'stream'
import createError from 'http-errors'

import { Invoice } from '@/modules/invoice/model'
import { AwsService } from '@/utils/AwsUtils'
import { CronService } from '@/modules/cron/service'
import { BaseService } from '@/core/BaseService'
import { RoleService } from '@/modules/role/service'
import { errorHandlerLogger } from '@/loggers/loggers'
import { HorseInvoiceReporter } from '@/modules/invoice/ClientInvoiceReporter'

import db from '@/database'
import i18next from '../../../i18n'
import { PathUtils } from '@/utils/PathUtils'
import { DateUtils } from '@/utils/DateUtils'

export class InvoiceService extends BaseService {
	constructor() {
		super(Invoice.getModelName(), 'invoice_404')
		this._cronService = new CronService()
		this._awsService = new AwsService()
	}

	async createInvoicesForUser(user, referenceDatetime = undefined) {
		// get the invoicing period
		let startingAt, endingAt
		const invoices = []
		const errors = []

		if (referenceDatetime) {
			const referenceDate = new Date(referenceDatetime)
			startingAt = DateUtils.getFirstDayOfThisMonth(referenceDate)
			endingAt = DateUtils.getLastDayOfThisMonth(referenceDate)
		} else {
			const referenceDate = new Date()
			startingAt = DateUtils.getFirstDayOfPreviousMonth(referenceDate)
			endingAt = DateUtils.getLastDayOfPreviousMonth(referenceDate)
		}

		const stable = await db.models.Stable.findOne({
			order: [['id', 'DESC']],
		})

		const contact = await db.models.Contact.findOne({
			where: { userId: user.id },
		})

		const horses = await db.models.Horse.findAll({
			where: {
				ownerId: user.id,
			},
		})

		const horseReporters = horses.map(horse => new HorseInvoiceReporter(horse, startingAt, endingAt))

		for (const horseReporter of horseReporters) {
			const existingInvoice = await db.models.Invoice.findOne({
				where: {
					clientId: user.id,
					horseId: horseReporter.horse.id,
					period: {
						[Op.between]: [startingAt, endingAt],
					},
				},
			})

			if (existingInvoice) {
				errors.push(i18next.t('invoice_422_alreadyExistingInvoice'))
				continue
			}

			const transaction1 = await db.transaction()
			let invoice, cron, pdf
			// create invoice and cron
			try {
				const dueDate = new Date()
				dueDate.setDate(dueDate.getDate() + 31) // 31 days to pay from the day the invoice has been generated

				// get report
				await horseReporter.getReport()

				const lastInvoice = await db.models.Invoice.findOne({
					order: [['id', 'DESC']],
				})

				if (horseReporter.totalPriceVatIncluded === 0.0) {
					continue
				}

				// create invoice
				invoice = await db.models.Invoice.create({
					clientId: user.id,
					horseId: horseReporter.horse.id,
					bucket: null,
					key: null,
					number: lastInvoice ? lastInvoice.number + 1 : 1,
					price: horseReporter.totalPriceVatIncluded,
					status: 'UNPAID',
					period: startingAt,
					dueDateAt: dueDate,
					paidAt: null,
				})
				//create cron
				cron = await this._cronService.create(invoice, this._awsService.bucket)
				await transaction1.commit()
			} catch (error) {
				errorHandlerLogger.log(
					'error',
					`error while creating invoice for client ${
						user.id
					} at date ${new Date()} with report ${horseReporter} : error ${error}`
				)
				errors.push(error)
				await transaction1.rollback()
				const roleService = new RoleService()
				const adminRole = await roleService.getRoleByNameOrFail('ADMIN')
				const adminSubRoleIds = await roleService.getSubRoleIds(adminRole)
				const admins = await db.models.User.findAll({
					where: {
						roleId: {
							[Op.in]: adminSubRoleIds,
						},
					},
				})

				for (const admin of admins) {
					await admin.sendMail(
						`Error while generating invoice for horse ${horseReporter.horse.id} of date ${new Date()}`,
						''
					)
				}
				continue
			}

			//generate pdf and update cron
			const transaction2 = await db.transaction()
			try {
				invoice = await this._updateInvoiceAccordingToAws(invoice, cron.name)
				cron = await this._cronService.markAsPdfGenerated(cron)
				pdf = await this._generateInvoicePdf(
					this._awsService.bucket,
					cron.name,
					stable,
					invoice,
					contact,
					horseReporter
				)

				// mind this update is not strictly required but we execute it to keep consistent
				await db.models.AdditiveData.update(
					{ status: 'INVOICED' },
					{
						where: {
							id: {
								[Op.in]: horseReporter.additiveDatasToUpdate,
							},
						},
					}
				)
				await transaction2.commit()
			} catch (error) {
				errorHandlerLogger.log(
					'error',
					`error while creating pdf invoice for client ${user.id} at date ${new Date()} : error ${error}`
				)
				errors.push(error)
				await transaction2.rollback()
				continue
			}

			// send the email with the invoice
			const transaction3 = await db.transaction()
			try {
				const templateSource = await readFile(
					path.join(PathUtils.getSrcPath(), 'modules', 'invoice', 'emails', 'invoice.hbs'),
					'utf8'
				)
				const template = handlebars.compile(templateSource)
				const html = template({ contact: contact, horse: horseReporter.horse })
				await user.sendMail(i18next.t('invoice'), html, [
					{
						filename: `${cron.name}`,
						content: pdf,
					},
				])
				await cron.markAsDone(cron)
				await transaction3.commit()
			} catch (error) {
				errorHandlerLogger.log(
					'error',
					`error while sending email for client ${user.id} at date ${new Date()} and invoice ${
						invoice.id
					} : error ${error}`
				)
				errors.push(error)
				await transaction3.rollback()
			}
			invoices.push(invoice)
		}

		return {
			errors: errors,
			invoices: invoices,
		}
	}

	async manualCreateInvoiceForUserId(userId, referenceDatetime = undefined) {
		const user = await db.models.User.findByPk(userId)
		if (!user) {
			throw createError(422, i18next.t('invoice_422_inexistingUser'))
		}
		return await this.createInvoicesForUser(user, referenceDatetime)
	}

	async markAsPaid(invoice, paidAt = undefined) {
		if (!paidAt) {
			paidAt = new Date()
		}
		if (paidAt < invoice.createdAt) {
			throw createError(422, i18next.t('invoice_422_markAsPaid_inconsistentDate'))
		}
		if (invoice.status === 'PAID') {
			throw createError(422, i18next.t('invoice_422_markAsPaid_alreadyPaid'))
		}

		return await super.update(invoice, {
			status: 'PAID',
			paidAt: paidAt,
		})
	}

	async markAsUnpaid(invoice) {
		if (invoice.status === 'UNPAID') {
			throw createError(422, i18next.t('invoice_422_markAsUnpaid_alreadyUnpaid'))
		}

		return await super.update(invoice, {
			status: 'UNPAID',
			paidAt: null,
		})
	}

	async _updateInvoiceAccordingToAws(invoice, key) {
		return await invoice
			.set({
				bucket: this._awsService.bucket,
				key: key,
			})
			.save()
	}

	async _generateInvoicePdf(bucket, key, stable, invoice, contact, horseReporter) {
		const pdfDoc = await PDFDocument.create()
		const width = 600
		const height = 800
		const page = pdfDoc.addPage([width, height])

		const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
		const fontSize = 12
		const lineHeight = fontSize * 1.2
		const margin = 50
		const availableWith = width - 2 * margin

		let currentX = margin
		let currentY = height - margin

		const drawText = (text, x, y, doesReturn = true, color = rgb(0, 0, 0)) => {
			const textWidth = font.widthOfTextAtSize(text, fontSize)
			page.drawText(text, { x, y, size: fontSize, color })
			currentX = x + textWidth
			if (doesReturn) {
				currentY -= lineHeight
				currentX = margin
			}
			return textWidth
		}

		const drawVerticalSpace = () => {
			currentY -= lineHeight
		}

		const drawHorizontalLine = () => {
			page.drawLine({
				start: { x: margin, y: currentY - lineHeight * 0.5 },
				end: { x: width - margin, y: currentY - lineHeight * 0.5 },
				color: rgb(0, 0, 0),
				thickness: 1,
			})
			currentY -= lineHeight * 1.5
		}

		const drawInvoiceItem = item => {
			// item {name: string, price: string, monthlyPrice ?: string, nbDays?: integer)
			;['name', 'monthlyPrice', 'nbDays', 'price'].forEach((key, index) => {
				currentX = margin + (index / 4) * availableWith
				let printedValue = !item[key] ? '-' : item[key]
				if (typeof printedValue === 'number') {
					printedValue = Number.isInteger(printedValue)
						? `${Number.parseInt(printedValue)}`
						: `${printedValue.toFixed(2)}`
				}
				drawText(`${printedValue}`, currentX, currentY, false)
			})
			currentY -= lineHeight
			currentX = margin
		}

		// Header
		drawText(stable.name, currentX, currentY)
		drawText(stable.vat, currentX, currentY)
		drawText(stable.phone, currentX, currentY)
		drawText(stable.email, currentX, currentY)
		drawText(stable.address, currentX, currentY)

		// To section
		drawVerticalSpace()
		drawText(`To : ${contact.firstName} ${contact.lastName}`, currentX, currentY)
		drawText(`At ${contact.invoicingAddress}`, currentX, currentY)
		drawVerticalSpace()

		//Invoice details
		drawVerticalSpace()
		drawText('Invoice', currentX, currentY, rgb(0, 0, 1))
		drawHorizontalLine()

		drawText('Invoice number: ', currentX, currentY, false)
		currentX = margin + 0.33 * availableWith
		drawText(`${stable.invoicePrefix}${invoice.number}`, currentX, currentY)

		drawText('Horse: ', currentX, currentY, false)
		currentX = margin + 0.33 * availableWith
		drawText(`${horseReporter.horse.name}`, currentX, currentY)

		drawText('Invoice date: ', currentX, currentY, false)
		currentX = margin + 0.33 * availableWith
		drawText(`${invoice.createdAt.toISOString().substring(0, 10)}`, currentX, currentY)

		drawText('Due date: ', currentX, currentY, false)
		currentX = margin + 0.33 * availableWith
		drawText(`${invoice.dueDateAt.toISOString().substring(0, 10)}`, currentX, currentY)

		drawText('Balance: ', currentX, currentY, false)
		currentX = margin + 0.33 * availableWith
		drawText(`${Number(invoice.price).toFixed(2)}`, currentX, currentY)

		drawText('Bank Account', currentX, currentY, false)
		currentX = margin + 0.33 * availableWith
		drawText(`${stable.iban}`, currentX, currentY, false)

		drawHorizontalLine()

		currentX = margin
		drawText('Name', currentX, currentY, false)
		currentX = margin + (1 / 4) * availableWith
		drawText('MonthlyPrice', currentX, currentY, false)
		currentX = margin + (1 / 2) * availableWith
		drawText('NbDays', currentX, currentY, false)
		currentX = margin + (3 / 4) * availableWith
		drawText('Price', currentX, currentY)
		drawText('', currentX, currentY)

		horseReporter.pensionDatasReport.forEach(pensionDataReport => {
			drawInvoiceItem(pensionDataReport)
		})

		horseReporter.rideDatasReport.forEach(rideDataReport => {
			drawInvoiceItem(rideDataReport)
		})

		horseReporter.additiveDatasReport.forEach(additiveDataReport => {
			drawInvoiceItem(additiveDataReport)
		})

		horseReporter.dailyRidesReport.forEach(dailyRideReport => {
			drawInvoiceItem(dailyRideReport)
		})

		drawHorizontalLine()
		currentX = (1 / 2) * availableWith
		drawText('Subtotal vat exlcuded', currentX, currentY, false)
		currentX = margin + (3 / 4) * availableWith
		drawText(`${Number(horseReporter.totalPriceVatExcluded).toFixed(2)}`, currentX, currentY)

		currentX = (1 / 2) * availableWith
		drawText('Subtotal vat', currentX, currentY, false)
		currentX = margin + (3 / 4) * availableWith
		drawText(
			`${(horseReporter.totalPriceVatIncluded - horseReporter.totalPriceVatExcluded).toFixed(2)}`,
			currentX,
			currentY
		)

		currentX = (1 / 2) * availableWith
		drawText('Total', currentX, currentY, false)
		currentX = margin + (3 / 4) * availableWith
		drawText(`${horseReporter.totalPriceVatIncluded.toFixed(2)}`, currentX, currentY)

		const pdfStream = new PassThrough()
		const pdfBytes = await pdfDoc.save()
		await pdfStream.end(pdfBytes)

		await this._awsService.upload(key, pdfStream)
		return pdfStream
	}
}
