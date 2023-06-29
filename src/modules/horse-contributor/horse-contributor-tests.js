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
		it('index with role admin', async function () {
			const horseContributors = await db.models.HorseContributor.bulkCreate(
				HorseContributorFactory.bulkCreate(10)
			)
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(horseContributors.length)
		})

		it('index with role employee', async function () {
			const horseContributors = await db.models.HorseContributor.bulkCreate(
				HorseContributorFactory.bulkCreate(10)
			)
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(horseContributors.length)
		})

		it('index with role client', async function () {
			const horseContributors = await db.models.HorseContributor.bulkCreate(
				HorseContributorFactory.bulkCreate(10)
			)
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(horseContributors.length)
		})
	})

	describe('show', async function () {
		it('show with role admin', async function () {
			const horseContributor = await db.models.HorseContributor.create(HorseContributorFactory.create())
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
			response.body.should.have.property('createdAt')
			response.body.should.have.property('updatedAt')
		})

		it('show with role employee', async function () {
			const horseContributor = await db.models.HorseContributor.create(HorseContributorFactory.create())
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${horseContributor.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
		})

		it('show with role client', async function () {
			const horseContributor = await db.models.HorseContributor.create(HorseContributorFactory.create())
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${horseContributor.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(200)
		})

		it('show with role admin - 404', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(404)
		})
	})

	describe('delete', async function () {
		it('delete with role admin', async function () {
			const horseContributor = await db.models.HorseContributor.create(HorseContributorFactory.create())
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${horseContributor.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(204)
		})

		it('delete with role employee', async function () {
			const horseContributor = await db.models.HorseContributor.create(HorseContributorFactory.create())
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${horseContributor.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(204)
		})

		it('delete with role client', async function () {
			const horseContributor = await db.models.HorseContributor.create(HorseContributorFactory.create())
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${horseContributor.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('horseContributor_unauthorized'))
		})

		it('delete with role admin - 404', async function () {
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(404)
		})
	})

	describe('create', async function () {
		describe('create valid', async function () {
			it('create valid - admin', async function () {
				const horseContributorJobData = HorseContributorFactory.create()
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(horseContributorJobData)
				response.should.have.status(201)

				response.body.should.have.property('id')
				response.body.should.have
					.property('firstName')
					.eql(StringUtils.capitalizeFirstLetter(horseContributorJobData.firstName.trim()))
				response.body.should.have
					.property('lastName')
					.eql(StringUtils.capitalizeFirstLetter(horseContributorJobData.lastName.trim()))
				response.body.should.have.property('email').eql(horseContributorJobData.email)
				response.body.should.have.property('createdAt')
				response.body.should.have.property('updatedAt')
			})

			it('create valid - employee', async function () {
				const horseContributorJobData = HorseContributorFactory.create()
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(horseContributorJobData)
				response.should.have.status(201)
			})

			it('create valid - client', async function () {
				const horseContributorJobData = HorseContributorFactory.create()
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testClientUser.token}`)
					.send(horseContributorJobData)
				response.should.have.status(201)
			})
		})

		describe('create invalid', async function () {
			describe('middleware', async function () {
				it('all', async function () {
					const data = {}

					const response = await chai
						.request(app)
						.post(`${routePrefix}`)
						.set('Authorization', `Bearer ${testAdminUser.token}`)
						.send(data)
					response.should.have.status(422)
					response.body.errors.map(error => error.path).should.eql(['email', 'firstName', 'lastName'])
				})
			})

			describe('sql', async function () {
				it('duplicate email entry', async function () {
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

				it('null lastName + invalid email', async function () {
					const data = {
						email: 'hellow world',
					}
					try {
						await db.models.HorseContributor.create(data)
					} catch (error) {
						error.errors.map(err => err.path).should.eql(['lastName', 'email'])
					}
				})
			})
		})
	})

	describe('update', function () {
		describe('update valid', async function () {
			it('with role admin', async function () {
				const horseContributor = await db.models.HorseContributor.create(HorseContributorFactory.create())
				const data = {
					firstName: 'updated',
					lastName: 'updated',
					email: 'updated@gmail.com',
				}
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
				response.body.should.have.property('createdAt')
				response.body.should.have.property('updatedAt')
			})

			it('with role employee', async function () {
				const horseContributor = await db.models.HorseContributor.create(HorseContributorFactory.create())
				const data = {
					firstName: 'updated',
					lastName: 'updated',
					email: 'updated@gmail.com',
				}
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${horseContributor.id}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(data)

				response.should.have.status(200)
			})

			it('with role client', async function () {
				const horseContributor = await db.models.HorseContributor.create(HorseContributorFactory.create())
				const data = {
					firstName: 'updated',
					lastName: 'updated',
					email: 'updated@gmail.com',
				}
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${horseContributor.id}`)
					.set('Authorization', `Bearer ${testClientUser.token}`)
					.send(data)

				response.should.have.status(401)
				response.body.should.have.property('message').eql(i18next.t('horseContributor_unauthorized'))
			})
		})
	})
})
