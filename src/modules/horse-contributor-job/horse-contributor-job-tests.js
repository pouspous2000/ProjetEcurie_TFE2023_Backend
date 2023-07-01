import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'
import i18next from '../../../i18n'

import app from '@/app'
import db from '@/database'
import { HorseContributorJobFactory } from '@/modules/horse-contributor-job/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { RoleFactory } from '@/modules/role/factory'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/horse_contributor_jobs'

describe('HorseContributorJob Module', function () {
	let testAdmin, testEmployee, testClient

	beforeEach(async function () {
		await db.models.PensionData.destroy({ truncate: { cascade: true } })
		await db.models.HorseContributorJob.destroy({ truncate: { cascade: true } })
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

	it('index', async function () {
		await db.models.HorseContributorJob.bulkCreate(HorseContributorJobFactory.bulkCreate(10))
		const response = await chai
			.request(app)
			.get(`${routePrefix}`)
			.set('Authorization', `Bearer ${testClient.token}`)

		response.should.have.status(200)
		response.body.should.have.length(10)
	})

	it('single valid', async function () {
		const veterinary = await db.models.HorseContributorJob.create(HorseContributorJobFactory.createVeterinary())

		const response = await chai
			.request(app)
			.get(`${routePrefix}/${veterinary.id}`)
			.set('Authorization', `Bearer ${testClient.token}`)
		response.should.have.status(200)
		response.body.should.have.property('name').eql(veterinary.name)
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

	it('delete with permission admin', async function () {
		const veterinary = await db.models.HorseContributorJob.create(HorseContributorJobFactory.createVeterinary())
		let response = await chai
			.request(app)
			.delete(`${routePrefix}/${veterinary.id}`)
			.set('Authorization', `Bearer ${testAdmin.token}`)
		response.should.have.status(204)
	})

	it('delete with permission client', async function () {
		const veterinary = await db.models.HorseContributorJob.create(HorseContributorJobFactory.createVeterinary())
		let response = await chai
			.request(app)
			.delete(`${routePrefix}/${veterinary.id}`)
			.set('Authorization', `Bearer ${testClient.token}`)
		response.should.have.status(401)
	})

	it('create with permission admin', async function () {
		const veterinaryObj = HorseContributorJobFactory.createVeterinary()
		const response = await chai
			.request(app)
			.post(`${routePrefix}`)
			.send(veterinaryObj)
			.set('Authorization', `Bearer ${testAdmin.token}`)
		response.should.have.status(201)
		response.body.should.have.property('name').eql(i18next.t('horseContributorJob_factory_veterinarian'))
		response.body.should.have.property('createdAt')
		response.body.should.have.property('updatedAt')
	})

	it('create with permission client', async function () {
		const veterinaryObj = HorseContributorJobFactory.createVeterinary()
		const response = await chai
			.request(app)
			.post(`${routePrefix}`)
			.send(veterinaryObj)
			.set('Authorization', `Bearer ${testClient.token}`)
		response.should.have.status(401)
	})

	it('create invalid - duplicate unique name', async function () {
		// we assume the error is the handled sql constraint error
		await db.models.HorseContributorJob.create(HorseContributorJobFactory.createVeterinary())
		const invalidDuplicateRecord = HorseContributorJobFactory.createVeterinary()
		const response = await chai
			.request(app)
			.post(`${routePrefix}`)
			.send(invalidDuplicateRecord)
			.set('Authorization', `Bearer ${testAdmin.token}`)
		response.should.have.status(422)
		response.body.should.have.property('message').eql(i18next.t('common_validation_error'))
		response.body.errors.should.have.length(1)
		response.body.errors[0].should.have.property('path').eql('name')
		response.body.errors[0].errors.should.eql([i18next.t('horseContributorJob_sql_validation_name_unique')])
	})

	it('create invalid - missing name', async function () {
		const invalidHorseContributorJob = {
			createdAt: new Date(),
			updatedAt: new Date(),
		}
		const response = await chai
			.request(app)
			.post(`${routePrefix}`)
			.send(invalidHorseContributorJob)
			.set('Authorization', `Bearer ${testAdmin.token}`)
		response.body.should.have.property('message').eql(i18next.t('common_validation_error'))
		response.should.have.status(422)
		response.body.errors.should.have.length(1)
		response.body.errors[0].should.have.property('path').eql('name')
		response.body.errors[0].errors.should.eql([i18next.t('horseContributorJob_request_validation_name_exists')])
	})

	it('update with admin', async function () {
		const veterinary = await db.models.HorseContributorJob.create(HorseContributorJobFactory.createVeterinary())
		const response = await chai
			.request(app)
			.put(`${routePrefix}/${veterinary.id}`)
			.send({
				name: 'updatedName',
			})
			.set('Authorization', `Bearer ${testAdmin.token}`)
		response.should.have.status(200)
		response.body.should.have.property('name').eql('Updatedname')
		response.body.should.have.property('createdAt')
		response.body.should.have.property('updatedAt')
	})

	it('update with client', async function () {
		const veterinary = await db.models.HorseContributorJob.create(HorseContributorJobFactory.createVeterinary())
		const response = await chai
			.request(app)
			.put(`${routePrefix}/${veterinary.id}`)
			.send({
				name: 'updatedName',
			})
			.set('Authorization', `Bearer ${testClient.token}`)
		response.should.have.status(401)
	})
})
