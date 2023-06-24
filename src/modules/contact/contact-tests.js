import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { ContactFactory } from '@/modules/contact/factory'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/contacts'

describe('Contact module', function () {
	let testAdminUser, testEmployeeUser, testClientUser
	let testAdminContact, testEmployeeContact, testClientContact

	beforeEach(async function () {
		await db.models.Contact.destroy({ truncate: { cascade: true } })
		await db.models.User.destroy({ truncate: { cascade: true } })
		await db.models.Role.destroy({ truncate: { cascade: true } })

		//create roles
		const roles = await db.models.Role.bulkCreate([
			RoleFactory.createAdmin(),
			RoleFactory.createEmployee(),
			RoleFactory.createClient(),
		])

		//create users
		testAdminUser = await db.models.User.create(
			UserFactory.createTestAdmin(roles.find(role => role.name === 'ADMIN').id)
		)
		testEmployeeUser = await db.models.User.create(
			UserFactory.createTestEmployee(roles.find(role => role.name === 'EMPLOYEE').id)
		)
		testClientUser = await db.models.User.create(
			UserFactory.createTestClient(roles.find(role => role.name === 'CLIENT').id)
		)

		testAdminUser.token = testAdminUser.generateToken()
		testEmployeeUser.token = testEmployeeUser.generateToken()
		testClientUser.token = testClientUser.generateToken()

		//create contacts
		testAdminContact = await db.models.Contact.create(ContactFactory.create(testAdminUser.id))
		testEmployeeContact = await db.models.Contact.create(ContactFactory.create(testEmployeeUser.id))
		testClientContact = await db.models.Contact.create(ContactFactory.create(testClientUser.id))
	})

	afterEach(function () {
		testAdminUser = testEmployeeUser = testClientUser = undefined
		testAdminContact = testEmployeeContact = testClientContact = undefined
	})

	describe('index ', async function () {
		it('index role admin', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(3)
		})

		it('index role employee', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(2)
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
			response.should.have.status(404)

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
			response.should.have.status(404)

			const response2 = await chai
				.request(app)
				.get(`${routePrefix}/${testEmployeeContact.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response2.should.have.status(404)

			const response3 = await chai
				.request(app)
				.get(`${routePrefix}/${testClientContact.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response3.should.have.status(200)
		})
	})
})
