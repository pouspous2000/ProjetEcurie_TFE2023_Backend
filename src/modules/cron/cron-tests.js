/*
	Note that the tests are not designed to test the cron itself but the service
*/

import { describe, it, beforeEach, afterEach } from 'mocha'
import { CronService } from '@/modules/cron/service'
import chai from 'chai'
import db from '@/database'
import { UserFactory } from '@/modules/authentication/factory'
import { RoleFactory } from '@/modules/role/factory'

chai.should()

describe('Cron module', async function () {
	let cronService = new CronService()
	let client

	beforeEach(async function () {
		await db.models.Invoice.destroy({ truncate: { cascade: true } })
		await db.models.Cron.destroy({ truncate: { cascade: true } })
		await db.models.User.destroy({ truncate: { cascade: true } })
		await db.models.Role.destroy({ truncate: { cascade: true } })

		const roleClient = await db.models.Role.create(RoleFactory.createClient())
		client = await db.models.User.create(UserFactory.create(roleClient.id, true))
	})

	afterEach(function () {
		client = undefined
	})

	describe('service', async function () {
		it('create', async function () {
			const now = new Date()
			const dueDateAt = new Date(now)
			dueDateAt.setMonth(now.getMonth() + 1)

			const invoice = await db.models.Invoice.create({
				clientId: client.id,
				bucket: null,
				key: null,
				number: 1,
				price: 10,
				status: 'UNPAID',
				dueDateAt: dueDateAt,
				paidAt: null,
			})

			const cron = await cronService.create(invoice)
			chai.should().equal(cron.name, `invoice${invoice.id}`)
			chai.should().equal(cron.step, 'PRE_PDF')
			chai.should().equal(cron.status, 'FAILED')
		})

		it('markAsPdfGenerated', async function () {
			const now = new Date()
			const dueDateAt = new Date(now)
			dueDateAt.setMonth(now.getMonth() + 1)

			const invoice = await db.models.Invoice.create({
				clientId: client.id,
				bucket: null,
				key: null,
				number: 1,
				price: 10,
				status: 'UNPAID',
				dueDateAt: dueDateAt,
				paidAt: null,
			})

			const cron = await cronService.create(invoice)
			await cronService.markAsPdfGenerated(cron)
			chai.should().equal(cron.name, `invoice${invoice.id}`)
			chai.should().equal(cron.step, 'PDF')
			chai.should().equal(cron.status, 'FAILED')
		})

		it('markAsDone', async function () {
			const now = new Date()
			const dueDateAt = new Date(now)
			dueDateAt.setMonth(now.getMonth() + 1)

			const invoice = await db.models.Invoice.create({
				clientId: client.id,
				bucket: null,
				key: null,
				number: 1,
				price: 10,
				status: 'UNPAID',
				dueDateAt: dueDateAt,
				paidAt: null,
			})

			const cron = await cronService.create(invoice)
			await cronService.markAsDone(cron)
			chai.should().equal(cron.name, `invoice${invoice.id}`)
			chai.should().equal(cron.step, 'PDF_SENT')
			chai.should().equal(cron.status, 'DONE')
		})
	})
})
