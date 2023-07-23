import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import { StableFactory } from '@/modules/stable/factory'

import app from '@/app'
import db from '@/database'
import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/stables'

describe('Stable Module', function () {
	let testAdmin, testEmployee, testClient

	beforeEach(async function () {
		await db.models.PensionData.destroy({ truncate: { cascade: true } })
		await db.models.Stable.destroy({ truncate: true })
		await db.models.User.destroy({ truncate: { cascade: true } })
		await db.models.Role.destroy({ truncate: { cascade: true } })

		const roles = await db.models.Role.bulkCreate([
			RoleFactory.createAdmin(),
			RoleFactory.createEmployee(),
			RoleFactory.createClient(),
		])

		testAdmin = await db.models.User.create(
			UserFactory.createTestAdmin(roles.find(role => role.name === 'ADMIN').id)
		)
		testEmployee = await db.models.User.create(
			UserFactory.createTestEmployee(roles.find(role => role.name === 'EMPLOYEE').id)
		)
		testClient = await db.models.User.create(
			UserFactory.createTestClient(roles.find(role => role.name === 'CLIENT').id)
		)

		testAdmin.token = testAdmin.generateToken()
		testEmployee.token = testEmployee.generateToken()
		testClient.token = testClient.generateToken()
	})

	afterEach(function () {
		testAdmin = testEmployee = testClient = undefined
	})

	it('single valid', async function () {
		const bonnet = await db.models.Stable.create(StableFactory.createBonnet())
		const response = await chai
			.request(app)
			.get(`${routePrefix}/${bonnet.id}`)
			.set('Authorization', `Bearer ${testClient.token}`)

		response.should.have.status(200)
		response.body.should.have.property('name').eql(bonnet.name)
		response.body.should.have.property('vat').eql(bonnet.vat)
		response.body.should.have.property('phone').eql(bonnet.phone)
		response.body.should.have.property('email').eql(bonnet.email)
		response.body.should.have.property('invoiceNb').eql(bonnet.invoiceNb)
		response.body.should.have.property('invoicePrefix').eql(bonnet.invoicePrefix)
		response.body.should.have.property('createdAt')
		response.body.should.have.property('updatedAt')
	})

	it('single 404', async function () {
		const response = await chai
			.request(app)
			.get(`${routePrefix}/1`)
			.set('Authorization', `Bearer ${testClient.token}`)
		response.should.have.status(404)
	})

	it('update success', async function () {
		const bonnet = await db.models.Stable.create(StableFactory.createBonnet())
		const response = await chai
			.request(app)
			.put(`${routePrefix}/${bonnet.id}`)
			.send({
				name: 'UpdatedName',
				vat: 'BE0123456787',
				phone: 'valid phone',
				email: 'test@bidon.com',
				invoiceNb: 10,
			})
			.set('Authorization', `Bearer ${testAdmin.token}`)

		response.should.have.status(200)
		response.body.should.have.property('name').eql('UpdatedName')
		response.body.should.have.property('vat').eql('BE0123456787')
		response.body.should.have.property('phone').eql('validphone')
		response.body.should.have.property('email').eql('test@bidon.com')
		response.body.should.have.property('invoiceNb').eql(10)
		response.body.should.have.property('invoicePrefix').eql(bonnet.invoicePrefix)
		response.body.should.have.property('createdAt')
		response.body.should.have.property('updatedAt')
	})

	it('update failure - role', async function () {
		const bonnet = await db.models.Stable.create(StableFactory.createBonnet())
		const response = await chai
			.request(app)
			.put(`${routePrefix}/${bonnet.id}`)
			.send({
				name: 'UpdatedName',
				vat: 'BE0123456787',
				phone: 'valid phone',
				email: 'test@bidon.com',
				invoiceNb: 10,
			})
			.set('Authorization', `Bearer ${testClient.token}`)

		response.should.have.status(401)
	})

	it('update failure', async function () {
		const bonnet = await db.models.Stable.create(StableFactory.createBonnet())
		const response = await chai
			.request(app)
			.put(`${routePrefix}/${bonnet.id}`)
			.send({
				vat: 'wrong',
				email: 'wrong',
				invoiceNb: -19,
			})
			.set('Authorization', `Bearer ${testAdmin.token}`)

		response.should.have.status(422)
		response.body.should.have.property('errors')
		response.body.errors.should.have.length(5)
	})
})
