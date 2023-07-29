import cron from 'node-cron'
import { InvoiceService } from '@/modules/invoice/service'
import { CronService } from '@/modules/cron/service'

export class InvoiceCron {
	constructor() {
		this._invoiceService = new InvoiceService()
		this._cronService = new CronService()
	}

	async start() {
		let i = 0 // will be deleted as soon as invoice logic is implemented
		const invoiceGenerationCron = cron.schedule(
			'0 0 1 * *', // every first day of the month at midnight
			async () => {
				i++
				try {
					const cron = await this._cronService.create(`invoice${i}`)
					await this._invoiceService.generateInvoice(`invoice${i}`)
					await this._cronService.markAsPdfGenerated(cron)
				} catch (error) {
					console.log('error', error)
				}
			},
			{
				scheduled: true,
				timezone: 'Europe/Paris',
			}
		)
		invoiceGenerationCron.start()
	}
}
