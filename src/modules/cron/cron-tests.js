/*
	Note that the tests are not designed to test the cron itself but the service
*/

import { describe, it, beforeEach } from 'mocha'
import { CronService } from '@/modules/cron/service'
import chai from 'chai'
import db from '@/database'

chai.should()

describe('Cron module', async function () {
	let cronService = new CronService()

	beforeEach(async function () {
		await db.models.Cron.destroy({ truncate: { cascade: true } })
	})

	describe('service', async function () {
		it('create', async function () {
			const cron = await cronService.create('name')
			chai.should().equal(cron.name, 'name')
			chai.should().equal(cron.step, 'PRE_PDF')
			chai.should().equal(cron.status, 'FAILED')
		})

		it('markAsPdfGenerated', async function () {
			const cron = await cronService.create('name')
			await cronService.markAsPdfGenerated(cron)
			chai.should().equal(cron.name, 'name')
			chai.should().equal(cron.step, 'PDF')
			chai.should().equal(cron.status, 'FAILED')
		})

		it('markAsDone', async function () {
			const cron = await cronService.create('name')
			await cronService.markAsDone(cron)
			chai.should().equal(cron.name, 'name')
			chai.should().equal(cron.step, 'PDF_SENT')
			chai.should().equal(cron.status, 'DONE')
		})
	})
})
