import { Op } from 'sequelize'
import cron from 'node-cron'
import { InvoiceService } from '@/modules/invoice/service'
import { RoleService } from '@/modules/role/service'
import db from '@/database'
import { errorHandlerLogger } from '@/loggers/loggers'

export class InvoiceCron {
	constructor() {
		this._invoiceService = new InvoiceService()
		this._roleService = new RoleService()
	}

	async start() {
		const invoiceGenerationCron = cron.schedule(
			'0 0 1 * *', // every first day of the month at midnight
			async () => {
				const clientRole = await this._roleService.getRoleByNameOrFail('CLIENT')
				const clientSubRoleIds = await this._roleService.getSubRoleIds(clientRole)

				const clientUsers = await db.models.User.findAll({
					where: {
						roleId: {
							[Op.in]: clientSubRoleIds,
						},
					},
				})

				for (const clientUser of clientUsers) {
					try {
						await this._invoiceService.createInvoicesForUser(clientUser)
					} catch (error) {
						errorHandlerLogger.log('error', error)
					}
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
