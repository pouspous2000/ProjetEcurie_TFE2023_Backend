import { describe, it, beforeEach, afterEach } from 'mocha'

import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'

import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { ContactFactory } from '@/modules/contact/factory'
import { InvoiceFactory } from '@/modules/invoice/factory'
import { CronFactory } from '@/modules/cron/factory'

import i18next from '../../../i18n'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/invoices'

describe('Invoice module', async function () {
	let roleAdmin, roleEmployee, roleClient
	let testAdminUser, testEmployeeUser, testClientUser1, testClientUser2
	// eslint-disable-next-line no-unused-vars
	let testClientContact1, testClientContact2

	beforeEach(async function () {
		await db.models.Cron.destroy({ truncate: { cascade: true } })
		await db.models.Invoice.destroy({ truncate: { cascade: true } })
		await db.models.User.destroy({ truncate: { cascade: true } })
		await db.models.Role.destroy({ truncate: { cascade: true } })

		//create roles
		roleAdmin = await db.models.Role.create(RoleFactory.createAdmin())
		roleEmployee = await db.models.Role.create(RoleFactory.createEmployee())
		roleClient = await db.models.Role.create(RoleFactory.createClient())

		//create users
		testAdminUser = await db.models.User.create(UserFactory.create(roleAdmin.id))
		testEmployeeUser = await db.models.User.create(UserFactory.create(roleEmployee.id))
		testClientUser1 = await db.models.User.create(UserFactory.create(roleClient.id))
		testClientUser2 = await db.models.User.create(UserFactory.create(roleClient.id))

		//generate contacts
		testClientContact1 = await db.models.Contact.create(ContactFactory.create(testClientUser1.id))
		testClientContact2 = await db.models.Contact.create(ContactFactory.create(testClientUser2.id))

		//generate tokens
		testAdminUser.token = testAdminUser.generateToken()
		testEmployeeUser.token = testEmployeeUser.generateToken()
		testClientUser1.token = testClientUser1.generateToken()
		testClientUser2.token = testClientUser2.generateToken()
	})

	afterEach(function () {
		roleAdmin = roleEmployee = roleClient = undefined
		testAdminUser = testEmployeeUser = testClientUser1 = undefined
		testClientContact1 = testClientUser2 = undefined
	})

	describe('index', async function () {
		describe('permissions', async function () {
			let invoices

			beforeEach(async function () {
				const invoiceObjs = []
				for (let i = 0; i < 5; i++) {
					invoiceObjs.push(InvoiceFactory.create(testClientUser1.id))
				}
				for (let i = 0; i < 3; i++) {
					invoiceObjs.push(InvoiceFactory.create(testClientUser2.id))
				}
				invoices = await db.models.Invoice.bulkCreate(invoiceObjs)
			})

			afterEach(function () {
				invoices = undefined
			})

			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.has.status(200)
				response.body.should.have.length(invoices.length)
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)

				response.should.has.status(200)
				response.body.should.have.length(invoices.length)
			})

			it('with role client', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.set('Authorization', `Bearer ${testClientUser1.token}`)

				response.should.has.status(200)
				response.body.should.have.length(
					invoices.filter(invoice => invoice.clientId === testClientUser1.id).length
				)
			})
		})

		describe('query parameters', async function () {
			it('middleware validation', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({ status: 'invalid', clientId: -1, cronStatus: 'invalid', year: -1, month: -1 })
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(422)
				response.body.errors
					.map(error => error.path)
					.should.eql(['status', 'clientId', 'cronStatus', 'year', 'month'])
			})

			it('clientId', async function () {
				await db.models.Invoice.create(InvoiceFactory.create(testClientUser1.id))

				const withQuery = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({ clientId: testClientUser1.id })
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				withQuery.body.should.have.length(1)

				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({ clientId: testClientUser2.id })
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)
			})

			it('status', async function () {
				const invoice = await db.models.Invoice.create(InvoiceFactory.create(testClientUser1.id))
				const oppositeStatus = invoice.status === 'PAID' ? 'UNPAID' : 'PAID'

				const withQuery = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({ status: invoice.status })
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				withQuery.body.should.have.length(1)

				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({ status: oppositeStatus })
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)
			})

			it('cronStatus', async function () {
				const invoice = await db.models.Invoice.create(InvoiceFactory.create(testClientUser1.id))
				const cron = await db.models.Cron.create(CronFactory.createSuccess(invoice.id))
				const oppositeCronStatus = cron.status === 'DONE' ? 'FAILED' : 'DONE'

				const withQuery = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({ cronStatus: cron.status })
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				withQuery.body.should.have.length(1)

				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({ cronStatus: oppositeCronStatus })
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)
			})

			it('year', async function () {
				const invoice = await db.models.Invoice.create(InvoiceFactory.create(testClientUser1.id))
				const year = invoice.createdAt.getFullYear()

				const withQuery = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({ year: year })
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				withQuery.body.should.have.length(1)

				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({ year: year + 1 })
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)
			})

			it('month', async function () {
				const invoice = await db.models.Invoice.create(InvoiceFactory.create(testClientUser1.id))
				const year = invoice.createdAt.getFullYear()
				const month = invoice.createdAt.getMonth()

				const withQuery = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({ year: year, month: month })
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				withQuery.body.should.have.length(1)

				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({ year: year, month: month + 1 })
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)

				const response2 = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({ month: month + 1 })
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response2.body.should.have.length(1)
			})
		})
	})

	describe('show', async function () {
		let invoice
		let cron

		beforeEach(async function () {
			invoice = await db.models.Invoice.create(InvoiceFactory.create(testClientUser1.id))
			cron = await db.models.Cron.create(CronFactory.create(invoice.id))
		})

		afterEach(function () {
			invoice = cron = undefined
		})

		it('404', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${invoice.id + 1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('invoice_404'))
		})

		it('with role admin', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${invoice.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.property('id').eql(invoice.id)
			response.body.should.have.property('client').eql({
				email: testClientUser1.email,
				userId: testClientContact1.userId,
				firstName: testClientContact1.firstName,
				lastName: testClientContact1.lastName,
				phone: testClientContact1.phone,
				mobile: testClientContact1.mobile,
				address: testClientContact1.address,
				invoicingAddress: testClientContact1.invoicingAddress,
			})
			response.body.should.have.property('cron').eql({
				id: cron.id,
				name: cron.name,
				step: cron.step,
				status: cron.status,
			})
			response.body.should.have.property('number').eql(invoice.number)
			response.body.should.have.property('status').eql(invoice.status)
			response.body.should.have.property('dueDateAt').eql(invoice.dueDateAt.toISOString())
			response.body.should.have.property('paidAt').eql(invoice.paidAt ? invoice.paidAt.toISOString() : null)
			response.body.should.have.property('createdAt').not.eql(null)
			response.body.should.have.property('updatedAt').not.eql(null)
			response.body.should.have
				.property('isUnpaidAfterDueDateAt')
				.eql(invoice.status === 'UNPAID' && new Date() > invoice.dueDateAt)
		})

		it('with role employee', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${invoice.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)

			response.should.have.status(200)
		})

		describe('with role client', async function () {
			it("other client's invoice - not allowed", async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}/${invoice.id}`)
					.set('Authorization', `Bearer ${testClientUser2.token}`)
				response.should.have.status(401)
				response.body.should.have.property('message').eql(i18next.t('invoice_401'))
			})

			it('own invoice - allowed', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}/${invoice.id}`)
					.set('Authorization', `Bearer ${testClientUser1.token}`)
				response.should.have.status(200)
			})
		})
	})

	// we do not test upload as it would require a mock of aws

	describe('markAsPaid', async function () {
		it('404', async function () {
			const lastInvoice = await db.models.Invoice.findOne({ order: [['id', 'DESC']] })
			const response = await chai
				.request(app)
				.post(`${routePrefix}/markAsPaid/${lastInvoice ? lastInvoice.id + 1 : 1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send({})

			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('invoice_404'))
		})

		describe('permissions', async function () {
			let invoice

			beforeEach(async function () {
				invoice = await db.models.Invoice.create(InvoiceFactory.create(testClientUser1.id))
			})

			afterEach(function () {
				invoice = undefined
			})

			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}/markAsPaid/${invoice.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})

				response.body.should.have.property('id').eql(invoice.id)
				response.body.should.have.property('status').eql('PAID')
				response.body.should.have.property('paidAt').not.eql(null)
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}/markAsPaid/${invoice.id}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send({})

				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})

			it('with role client', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}/markAsPaid/${invoice.id}`)
					.set('Authorization', `Bearer ${testClientUser1.token}`)
					.send({})

				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})
		})

		describe('service', async function () {
			it('invalid paidAt', async function () {
				const invoice = await db.models.Invoice.create(InvoiceFactory.create(testClientUser1.id))
				const yesterday = new Date()
				yesterday.setDate(yesterday.getDate() - 1)

				const response = await chai
					.request(app)
					.post(`${routePrefix}/markAsPaid/${invoice.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({ paidAt: yesterday })

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('invoice_422_markAsPaid_inconsistentDate'))
			})

			it('invalid status', async function () {
				const invoice = await db.models.Invoice.create(InvoiceFactory.create(testClientUser1.id, 'PAID'))

				const response = await chai
					.request(app)
					.post(`${routePrefix}/markAsPaid/${invoice.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('invoice_422_markAsPaid_alreadyPaid'))
			})
		})
	})

	describe('markAsUnpaid', async function () {
		it('404', async function () {
			const lastInvoice = await db.models.Invoice.findOne({ order: [['id', 'DESC']] })
			const response = await chai
				.request(app)
				.post(`${routePrefix}/markAsUnpaid/${lastInvoice ? lastInvoice.id + 1 : 1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send({})

			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('invoice_404'))
		})

		describe('permissions', async function () {
			let invoice

			beforeEach(async function () {
				invoice = await db.models.Invoice.create(InvoiceFactory.create(testClientUser1.id, 'PAID'))
			})

			afterEach(function () {
				invoice = undefined
			})

			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}/markAsUnpaid/${invoice.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})
				response.should.have.status(200)
				response.body.should.have.property('id').eql(invoice.id)
				response.body.should.have.property('status').eql('UNPAID')
				response.body.should.have.property('paidAt').eql(null)
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}/markAsUnpaid/${invoice.id}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send({})

				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})

			it('with role client', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}/markAsUnpaid/${invoice.id}`)
					.set('Authorization', `Bearer ${testClientUser1.token}`)
					.send({})

				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})
		})

		describe('service', async function () {
			it('invalid status', async function () {
				const invoice = await db.models.Invoice.create(InvoiceFactory.create(testClientUser1.id))

				const response = await chai
					.request(app)
					.post(`${routePrefix}/markAsUnpaid/${invoice.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('invoice_422_markAsUnpaid_alreadyUnpaid'))
			})
		})
	})
})
