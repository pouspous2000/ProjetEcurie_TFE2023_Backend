import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { PensionFactory } from '@/modules/pension/factory'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/pensions'

describe('Pension module', function () {
	let testAdminUser, testEmployeeUser, testClientUser
	let roleAdmin, roleEmployee, roleClient

	beforeEach(async function () {
		await db.models.Pension.destroy({ truncate: { cascade: true } })
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

		testAdminUser.token = testAdminUser.generateToken()
		testEmployeeUser.token = testEmployeeUser.generateToken()
		testClientUser.token = testClientUser.generateToken()
	})
	afterEach(async function () {
		testAdminUser = testEmployeeUser = testClientUser = undefined
		roleAdmin = roleEmployee = roleClient = undefined
	})

	describe('index', async function () {
		it('index with role admin', async function () {
			const pensions = await db.models.Pension.bulkCreate(PensionFactory.bulkCreate(10))
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(pensions.length)
		})

		it('index with role employee', async function () {
			const pensions = await db.models.Pension.bulkCreate(PensionFactory.bulkCreate(3))
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(pensions.length)
		})

		it('index with role client', async function () {
			const pensions = await db.models.Pension.bulkCreate(PensionFactory.bulkCreate(10))
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(pensions.length)
		})
	})

	describe('show', async function () {
		it('show with role admin', async function () {
			const pension = await db.models.Pension.create(PensionFactory.create())
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${pension.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.property('id').eql(pension.id)
			response.body.should.have.property('name').eql(pension.name)
			response.body.should.have.property('monthlyPrice').eql(pension.monthlyPrice)
			response.body.should.have.property('description').eql(pension.description)
			response.body.should.have.property('createdAt')
			response.body.should.have.property('updatedAt')
		})

		it('show with role employee', async function () {
			const pensionObj = PensionFactory.create()
			const pension = await db.models.Pension.create(pensionObj)
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${pension.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
		})

		it('show with role client', async function () {
			const pensionObj = PensionFactory.create()
			const pension = await db.models.Pension.create(pensionObj)
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${pension.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(200)
		})

		it('404 role admin but does not matter', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(404)
		})
	})
})
