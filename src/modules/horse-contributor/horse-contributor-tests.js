import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'

import { StringUtils } from '@/utils/StringUtils'
import { HorseContributorFactory } from '@/modules/horse-contributor/factory'
import i18next from '../../../i18n'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/horse_contributors'

describe('HorseContributor module', function () {
	let testAdminUser, testEmployeeUser, testClientUser
	let roleAdmin, roleEmployee, roleClient

	beforeEach(async function () {
		await db.models.HorseContributor.destroy({ truncate: { cascade: true } })
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
		let horseContributors

		beforeEach(async function () {
			horseContributors = await db.models.HorseContributor.bulkCreate(HorseContributorFactory.bulkCreate(10))
		})

		afterEach(function () {})

		it('with role admin', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(horseContributors.length)
		})

		it('with role employee', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(horseContributors.length)
		})

		it('with role client', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(horseContributors.length)
		})
	})

	describe('show', async function () {
		let horseContributor

		beforeEach(async function () {
			horseContributor = await db.models.HorseContributor.create(HorseContributorFactory.create())
		})

		afterEach(function () {
			horseContributor = undefined
		})

		it('with role admin', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${horseContributor.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.property('id').eql(horseContributor.id)
			response.body.should.have
				.property('firstName')
				.eql(StringUtils.capitalizeFirstLetter(horseContributor.firstName.trim()))
			response.body.should.have
				.property('lastName')
				.eql(StringUtils.capitalizeFirstLetter(horseContributor.lastName.trim()))
			response.body.should.have.property('email').eql(horseContributor.email)
			response.body.should.have.property('createdAt').not.eql(null)
			response.body.should.have.property('updatedAt').not.eql(null)
		})

		it('with role employee', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${horseContributor.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
		})

		it('with role client', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${horseContributor.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)

			response.should.have.status(200)
		})

		it('404', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${horseContributor.id + 1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('horseContributor_404'))
		})
	})

	describe('delete', async function () {
		let horseContributor

		beforeEach(async function () {
			horseContributor = await db.models.HorseContributor.create(HorseContributorFactory.create())
		})

		afterEach(function () {
			horseContributor = undefined
		})

		describe('permissions', async function () {
			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${horseContributor.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(204)

				const deletedHc = await db.models.HorseContributor.findByPk(horseContributor.id)
				chai.should().equal(deletedHc, null)
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${horseContributor.id}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)

				response.should.have.status(204)
			})

			it('with role client', async function () {
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${horseContributor.id}`)
					.set('Authorization', `Bearer ${testClientUser.token}`)

				response.should.have.status(401)
				response.body.should.have.property('message').eql(i18next.t('horseContributor_401'))
			})
		})

		it('404', async function () {
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${horseContributor.id + 1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('horseContributor_404'))
		})
	})

	describe('create', async function () {
		describe('permissions', async function () {
			let data

			beforeEach(function () {
				data = HorseContributorFactory.create()
			})

			afterEach(function () {
				data = undefined
			})

			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(201)
				response.body.should.have.property('id')
				response.body.should.have
					.property('firstName')
					.eql(StringUtils.capitalizeFirstLetter(data.firstName.trim()))
				response.body.should.have
					.property('lastName')
					.eql(StringUtils.capitalizeFirstLetter(data.lastName.trim()))
				response.body.should.have.property('email').eql(data.email)
				response.body.should.have.property('createdAt').not.eql(null)
				response.body.should.have.property('updatedAt').not.eql(null)
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(data)

				response.should.have.status(201)
			})

			it('with role client', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testClientUser.token}`)
					.send(data)

				response.should.have.status(201)
			})
		})

		describe('middleware', async function () {
			it('null mandatory values', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})

				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['firstName', 'lastName', 'email'])
			})
		})

		describe('sql', async function () {
			it('duplicate email', async function () {
				const horseContributor1 = await db.models.HorseContributor.create(HorseContributorFactory.create())
				const horseContributor2Data = HorseContributorFactory.create()
				horseContributor2Data.email = horseContributor1.email

				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(horseContributor2Data)
				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['email'])
			})
		})
	})

	describe('update', async function () {
		let horseContributor, data

		beforeEach(async function () {
			horseContributor = await db.models.HorseContributor.create(HorseContributorFactory.create())
			data = {
				firstName: 'updated',
				lastName: 'updated',
				email: 'update@gmail.com',
			}
		})

		afterEach(function () {
			horseContributor = undefined
			data = undefined
		})

		it('404', async function () {
			const response = await chai
				.request(app)
				.put(`${routePrefix}/${horseContributor.id + 1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(data)
			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('horseContributor_404'))
		})

		describe('permissions', async function () {
			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${horseContributor.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)
				response.should.have.status(200)
				response.body.should.have.property('id').eql(horseContributor.id)
				response.body.should.have
					.property('firstName')
					.eql(StringUtils.capitalizeFirstLetter(data.firstName.trim().toLowerCase()))
				response.body.should.have
					.property('lastName')
					.eql(StringUtils.capitalizeFirstLetter(data.lastName.trim().toLowerCase()))
				response.body.should.have.property('email').eql(data.email)
				response.body.should.have.property('createdAt').not.eql(null)
				response.body.should.have.property('updatedAt').not.eql(null)
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${horseContributor.id}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(data)
				response.should.have.status(200)
			})

			it('with role client', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${horseContributor.id}`)
					.set('Authorization', `Bearer ${testClientUser.token}`)
					.send(data)
				response.should.have.status(401)
				response.body.should.have.property('message').eql(i18next.t('horseContributor_401'))
			})
		})

		describe('middleware', async function () {
			it('null mandatory values', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${horseContributor.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})

				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['firstName', 'lastName', 'email'])
			})
		})
	})
})
