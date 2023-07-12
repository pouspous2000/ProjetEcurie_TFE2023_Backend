import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'

import { StringUtils } from '@/utils/StringUtils'
import { RideFactory } from '@/modules/ride/factory'
import i18next from '../../../i18n'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/rides'

describe('Ride module', function () {
	let testAdminUser, testEmployeeUser, testClientUser
	let roleAdmin, roleEmployee, roleClient

	beforeEach(async function () {
		await db.models.Ride.destroy({ truncate: { cascade: true }, force: true })
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

		//generate tokens
		testAdminUser.token = testAdminUser.generateToken()
		testEmployeeUser.token = testEmployeeUser.generateToken()
		testClientUser.token = testClientUser.generateToken()
	})

	afterEach(function () {
		testAdminUser = testEmployeeUser = testClientUser = undefined
		roleAdmin = roleEmployee = roleClient = undefined
	})

	describe('index', async function () {
		it('with role admin', async function () {
			const rides = await db.models.Ride.bulkCreate(RideFactory.createAll()) // create 4 rides
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(rides.length)
		})

		it('with role employee', async function () {
			const rides = await db.models.Ride.bulkCreate(RideFactory.createAll()) // create 4 rides
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(rides.length)
		})

		it('with role client', async function () {
			const rides = await db.models.Ride.bulkCreate(RideFactory.createAll()) // create 4 rides
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(rides.length)
		})
	})

	describe('show', async function () {
		it('with role admin', async function () {
			const ride = await db.models.Ride.create(RideFactory.create('WORKINGDAYS'))
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${ride.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(200)
			response.body.should.have.property('id').eql(ride.id)
			response.body.should.have
				.property('name')
				.eql(StringUtils.capitalizeFirstLetter(ride.name.trim().toLowerCase()))
			response.body.should.have.property('period').eql(ride.period)
			response.body.should.have.property('price').eql(ride.price)
			response.body.should.have.property('createdAt')
			response.body.should.have.property('updatedAt')
			response.body.should.have.property('deletedAt').eql(null)
		})

		it('with role employee', async function () {
			const ride = await db.models.Ride.create(RideFactory.create('WORKINGDAYS'))
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${ride.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
		})

		it('with role client', async function () {
			const ride = await db.models.Ride.create(RideFactory.create('WORKINGDAYS'))
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${ride.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(200)
		})

		it('with role admin - 404', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('ride_404'))
		})
	})

	describe('delete', async function () {
		it('with role admin', async function () {
			const ride = await db.models.Ride.create(RideFactory.create('WORKINGDAYS'))
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${ride.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(204)
			const deletedPension = await db.models.Ride.findByPk(ride.id, { paranoid: false })
			deletedPension.should.have.property('deletedAt').not.to.be.null
		})

		it('with role employee', async function () {
			const ride = await db.models.Ride.create(RideFactory.create('WORKINGDAYS'))
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${ride.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)

			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('authentication_role_incorrectRolePermission'))
		})

		it('with role client', async function () {
			const ride = await db.models.Ride.create(RideFactory.create('WORKINGDAYS'))
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${ride.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)

			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('authentication_role_incorrectRolePermission'))
		})

		it('with role admin - 404', async function () {
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('ride_404'))
		})
	})
})
