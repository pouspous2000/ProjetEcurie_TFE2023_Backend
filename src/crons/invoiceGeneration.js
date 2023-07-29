import cron from 'node-cron'
import { InvoiceService } from '@/modules/invoice/service'

export default async function startInvoiceGenerationCron() {
	const invoiceService = new InvoiceService()

	let i = 1
	const invoiceGenerationCron = cron.schedule(
		'0 0 1 * *', // every first day of the month at midnight
		async () => {
			i++
			try {
				await invoiceService.generateInvoice(`invoice${i}`)
			} catch (error) {
				console.log('error', error)
				// we do not throw an error as it would shut down the application
			}
		},
		{
			scheduled: true,
			timezone: 'Europe/Paris',
		}
	)
	invoiceGenerationCron.start()
}
