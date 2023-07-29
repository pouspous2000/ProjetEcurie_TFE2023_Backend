import cron from 'node-cron'
// import { InvoiceService } from '@/modules/invoice/service'

export default function startInvoiceGenerationCron() {
	let i = 0
	const invoiceGenerationCron = cron.schedule(
		'*/1 * * * * *',
		() => {
			i++
			console.log('le cron a ete appele ...  i', i)
		},
		{
			scheduled: true,
			timezone: 'Europe/Paris',
		}
	)
	invoiceGenerationCron.start()
}
