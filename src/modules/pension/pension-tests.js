import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { PensionFactory } from '@/modules/pension/factory'
import { StringUtils } from '@/utils/StringUtils'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/pensions'

describe('Pension module', function () {
	let testAdminUser, testEmployeeUser, testClientUser
	let roleAdmin, roleEmployee, roleClient

	beforeEach(async function () {
		await db.models.PensionData.destroy({ truncate: { cascade: true } })
		await db.models.Pension.destroy({ truncate: { cascade: true }, force: true })
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

	describe('delete', async function () {
		it('delete with role admin', async function () {
			const pension = await db.models.Pension.create(PensionFactory.create())
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${pension.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(204)
			const deletedPension = await db.models.Pension.findByPk(pension.id, { paranoid: false })
			deletedPension.should.have.property('deletedAt').not.to.be.null
		})

		it('delete with role employee', async function () {
			const pension = await db.models.Pension.create(PensionFactory.create())
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${pension.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)

			response.should.have.status(401)
		})

		it('delete with role client', async function () {
			const pension = await db.models.Pension.create(PensionFactory.create())
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${pension.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)

			response.should.have.status(401)
		})
	})

	describe('create', async function () {
		it('create valid - role admin', async function () {
			const pensionData = PensionFactory.create()
			const response = await chai
				.request(app)
				.post(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(pensionData)
			response.should.have.status(201)
			response.body.should.have.property('id')
			response.body.should.have
				.property('name')
				.eql(StringUtils.capitalizeFirstLetter(pensionData.name.toLowerCase()))
			response.body.should.have.property('description').eql(pensionData.description)
			response.body.should.have.property('createdAt')
			response.body.should.have.property('updatedAt')
		})

		it('create valid - role employee', async function () {
			const pensionData = PensionFactory.create()
			const response = await chai
				.request(app)
				.post(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
				.send(pensionData)
			response.should.have.status(401)
		})

		it('create valid - role client', async function () {
			const pensionData = PensionFactory.create()
			const response = await chai
				.request(app)
				.post(`${routePrefix}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
				.send(pensionData)
			response.should.have.status(401)
		})

		it('create invalid - middleware', async function () {
			const pensionData = {}
			const response = await chai
				.request(app)
				.post(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(pensionData)
			response.should.have.status(422)
			response.body.errors.map(error => error.path).should.eql(['description', 'name', 'monthlyPrice'])
		})

		describe('create invalid - sql errors', async function () {
			it('duplicate name entry', async function () {
				const pension1 = await db.models.Pension.create(PensionFactory.create())
				const pension2 = PensionFactory.create()
				pension2.name = pension1.name

				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(pension2)

				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['name'])
			})

			it('negative monthlyPrice', async function () {
				const pension = PensionFactory.create()
				pension.monthlyPrice = '-3.234'
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(pension)

				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['monthlyPrice'])
			})
		})
	})

	describe('update', async function () {
		// we will only check permissions as the update validation rules are the same and also for the views
		it('with role admin', async function () {
			const pension = await db.models.Pension.create(PensionFactory.create())
			const updatedData = PensionFactory.create()

			const response = await chai
				.request(app)
				.put(`${routePrefix}/${pension.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(updatedData)
			response.should.have.status(200)
			response.body.should.have.property('id').eql(pension.id)
			response.body.should.have
				.property('name')
				.eql(StringUtils.capitalizeFirstLetter(updatedData.name.toLowerCase()))
			response.body.should.have.property('description').eql(updatedData.description)
			response.body.should.have.property('createdAt')
			response.body.should.have.property('updatedAt')
		})
		it('with role employee', async function () {
			const pension = await db.models.Pension.create(PensionFactory.create())
			const updatedData = PensionFactory.create()

			const response = await chai
				.request(app)
				.put(`${routePrefix}/${pension.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
				.send(updatedData)

			response.should.have.status(401)
		})

		it('with role client', async function () {
			const pension = await db.models.Pension.create(PensionFactory.create())
			const updatedData = PensionFactory.create()

			const response = await chai
				.request(app)
				.put(`${routePrefix}/${pension.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
				.send(updatedData)

			response.should.have.status(401)
		})
	})
})
