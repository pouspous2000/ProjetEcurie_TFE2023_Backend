import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { ContactFactory } from '@/modules/contact/factory'
import { StringUtils } from '@/utils/StringUtils'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/contacts'

describe('Contact module', function () {
	let testAdminUser, testEmployeeUser, testClientUser, testClientUser2
	let testAdminContact, testEmployeeContact, testClientContact, testClientContact2
	let roleAdmin, roleEmployee, roleClient

	beforeEach(async function () {
		await db.models.PensionData.destroy({ truncate: { cascade: true } })
		await db.models.Contact.destroy({ truncate: { cascade: true } })
		await db.models.User.destroy({ truncate: { cascade: true } })
		await db.models.Role.destroy({ truncate: { cascade: true } })

		//create roles
		roleAdmin = await db.models.Role.create(RoleFactory.createAdmin())
		roleEmployee = await db.models.Role.create(RoleFactory.createEmployee())
		roleClient = await db.models.Role.create(RoleFactory.createClient())

		//create users
		testAdminUser = await db.models.User.create(UserFactory.createTestAdmin(roleAdmin.id))
		testEmployeeUser = await db.models.User.create(UserFactory.createTestEmployee(roleEmployee.id))
		testClientUser = await db.models.User.create(UserFactory.createTestClient(roleClient.id))
		testClientUser2 = await db.models.User.create(UserFactory.create(roleClient.id, true))

		testAdminUser.token = testAdminUser.generateToken()
		testEmployeeUser.token = testEmployeeUser.generateToken()
		testClientUser.token = testClientUser.generateToken()

		//create contacts
		testAdminContact = await db.models.Contact.create(ContactFactory.create(testAdminUser.id))
		testEmployeeContact = await db.models.Contact.create(ContactFactory.create(testEmployeeUser.id))
		testClientContact = await db.models.Contact.create(ContactFactory.create(testClientUser.id))
		testClientContact2 = await db.models.Contact.create(ContactFactory.create(testClientUser2.id))
	})

	afterEach(function () {
		testAdminUser = testEmployeeUser = testClientUser = testClientUser2 = undefined
		testAdminContact = testEmployeeContact = testClientContact = testClientContact2 = undefined
		roleAdmin = roleEmployee = roleClient = undefined
	})

	describe('index ', async function () {
		it('index role admin', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(4)
		})

		it('index role employee', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(3)
		})

		it('index role client', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(1)
		})
	})

	describe('show', async function () {
		it('show  with role admin', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${testAdminContact.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(200)

			const response2 = await chai
				.request(app)
				.get(`${routePrefix}/${testEmployeeContact.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response2.should.have.status(200)

			const response3 = await chai
				.request(app)
				.get(`${routePrefix}/${testClientContact.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response3.should.have.status(200)
		})

		it('show with role employee', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${testAdminContact.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(401)

			const response2 = await chai
				.request(app)
				.get(`${routePrefix}/${testEmployeeContact.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response2.should.have.status(200)

			const response3 = await chai
				.request(app)
				.get(`${routePrefix}/${testClientContact.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response3.should.have.status(200)
		})

		it('show with role client', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${testAdminContact.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(401)

			const response2 = await chai
				.request(app)
				.get(`${routePrefix}/${testEmployeeContact.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response2.should.have.status(401)

			const response3 = await chai
				.request(app)
				.get(`${routePrefix}/${testClientContact.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response3.should.have.status(200)
		})
	})

	describe('delete', async function () {
		it('delete  with role admin', async function () {
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${testAdminContact.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(204)

			const response2 = await chai
				.request(app)
				.delete(`${routePrefix}/${testEmployeeContact.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response2.should.have.status(204)

			const response3 = await chai
				.request(app)
				.delete(`${routePrefix}/${testClientContact.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response3.should.have.status(204)
		})

		it('delete  with role employee', async function () {
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${testAdminContact.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(401)

			const response2 = await chai
				.request(app)
				.delete(`${routePrefix}/${testEmployeeContact.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response2.should.have.status(204)

			const response3 = await chai
				.request(app)
				.delete(`${routePrefix}/${testClientContact.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response3.should.have.status(204)
		})

		it('delete  with role client', async function () {
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${testAdminContact.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(401)

			const response2 = await chai
				.request(app)
				.delete(`${routePrefix}/${testEmployeeContact.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response2.should.have.status(401)

			const response3 = await chai
				.request(app)
				.delete(`${routePrefix}/${testClientContact.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response3.should.have.status(204)
		})
	})

	describe('create', async function () {
		describe('create valid client contact', async function () {
			it('with role admin', async function () {
				const client = await db.models.User.create(UserFactory.create(roleClient.id, true))
				const contactData = ContactFactory.create(client.id)
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(contactData)
				response.should.have.status(201)
				response.body.should.have.property('firstName').eql(contactData.firstName)
				response.body.should.have.property('lastName').eql(contactData.lastName)
				response.body.should.have.property('phone').eql(contactData.phone)
				response.body.should.have.property('address').eql(contactData.address)
				response.body.should.have.property('invoicingAddress').eql(contactData.invoicingAddress)
				response.body.should.have.property('createdAt')
				response.body.should.have.property('updatedAt')
			})

			it('with role employee', async function () {
				const client = await db.models.User.create(UserFactory.create(roleClient.id, true))
				const contactData = ContactFactory.create(client.id)
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(contactData)
				response.should.have.status(201)
			})

			it('with role client', async function () {
				const client = await db.models.User.create(UserFactory.create(roleClient.id, true))
				const contactData = ContactFactory.create(client.id)
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testClientUser.token}`)
					.send(contactData)
				response.should.have.status(401)
			})
		})

		describe('create invalid - middleware', async function () {
			it('with role admin but does not matter', async function () {
				const data = {}
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)
				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['userId', 'firstName', 'lastName', 'address'])
			})
		})

		describe('create invalid - sql', async function () {
			it('with role admin but does not matter', async function () {
				const client = await db.models.User.create(UserFactory.create(roleClient.id, true))
				const contactData = ContactFactory.create(client.id)
				contactData.mobile = testClientContact.mobile

				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(contactData)
				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['mobile'])
			})
		})
	})

	describe('update valid client contact', async function () {
		it('with role admin', async function () {
			const contactData = {
				firstName: 'updatedFirstName',
				lastName: 'updatedLastName',
				address: 'updatedAddress',
				phone: 'updatedPhone',
				mobile: 'updatedMobile',
				invoicingAddress: 'updatedInvoicingAddress',
			}

			const response = await chai
				.request(app)
				.put(`${routePrefix}/${testClientContact.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(contactData)
			response.should.have.status(200)
			response.body.should.have.property('id').eql(testClientContact.id)
			response.body.should.have
				.property('firstName')
				.eql(StringUtils.capitalizeFirstLetter(contactData.firstName))
			response.body.should.have.property('lastName').eql(StringUtils.capitalizeFirstLetter(contactData.lastName))
			response.body.should.have.property('phone').eql(contactData.phone)
			response.body.should.have.property('address').eql(contactData.address)
			response.body.should.have.property('invoicingAddress').eql(contactData.invoicingAddress)
			response.body.should.have.property('createdAt')
			response.body.should.have.property('updatedAt')
		})

		it('with role employee', async function () {
			const contactData = {
				firstName: 'updatedFirstName',
				lastName: 'updatedLastName',
				address: 'updatedAddress',
				phone: 'updatedPhone',
				mobile: 'updatedMobile',
				invoicingAddress: 'updatedInvoicingAddress',
			}
			const response = await chai
				.request(app)
				.put(`${routePrefix}/${testClientContact.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
				.send(contactData)
			response.should.have.status(200)
		})

		it('with role employee and not self', async function () {
			const contactData = {
				firstName: 'updatedFirstName',
				lastName: 'updatedLastName',
				address: 'updatedAddress',
				phone: 'updatedPhone',
				mobile: 'updatedMobile',
				invoicingAddress: 'updatedInvoicingAddress',
			}
			const response = await chai
				.request(app)
				.put(`${routePrefix}/${testClientContact2.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
				.send(contactData)
			response.should.have.status(401)
		})

		it('with role employee and self', async function () {
			const contactData = {
				firstName: 'updatedFirstName',
				lastName: 'updatedLastName',
				address: 'updatedAddress',
				phone: 'updatedPhone',
				mobile: 'updatedMobile',
				invoicingAddress: 'updatedInvoicingAddress',
			}
			const response = await chai
				.request(app)
				.put(`${routePrefix}/${testClientContact.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
				.send(contactData)
			response.should.have.status(200)
		})
	})
})
