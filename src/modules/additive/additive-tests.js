import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'

import { StringUtils } from '@/utils/StringUtils'
import i18next from '../../../i18n'
import { AdditiveFactory } from '@/modules/additive/factory'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/additives'

describe('Additive module', function () {
	let testAdminUser, testEmployeeUser, testClientUser
	let roleAdmin, roleEmployee, roleClient

	beforeEach(async function () {
		await db.models.PensionData.destroy({ truncate: { cascade: true } })
		await db.models.Additive.destroy({ truncate: { cascade: true } })
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
			const additives = await db.models.Additive.bulkCreate(AdditiveFactory.bulkCreate(10))
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(additives.length)
		})

		it('index with role employee', async function () {
			const additives = await db.models.Additive.bulkCreate(AdditiveFactory.bulkCreate(10))
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(additives.length)
		})

		it('index with role client', async function () {
			const additives = await db.models.Additive.bulkCreate(AdditiveFactory.bulkCreate(10))
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(additives.length)
		})
	})

	describe('show', async function () {
		it('show with role admin', async function () {
			const additive = await db.models.Additive.create(AdditiveFactory.create())
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${additive.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(200)
			response.body.should.have.property('id').eql(additive.id)
			response.body.should.have
				.property('name')
				.eql(StringUtils.capitalizeFirstLetter(additive.name.trim().toLowerCase()))
			response.body.should.have.property('price').eql(additive.price)
			response.body.should.have.property('createdAt')
			response.body.should.have.property('updatedAt')
		})

		it('show with role employee', async function () {
			const additive = await db.models.Additive.create(AdditiveFactory.create())
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${additive.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
		})

		it('show with role client', async function () {
			const additive = await db.models.Additive.create(AdditiveFactory.create())
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${additive.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(200)
		})

		it('show with role admin - 404', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('additive_404'))
		})
	})

	describe('delete', async function () {
		it('delete with role admin', async function () {
			const additive = await db.models.Additive.create(AdditiveFactory.create())
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${additive.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(204)
		})

		it('delete with role employee', async function () {
			const additive = await db.models.Additive.create(AdditiveFactory.create())
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${additive.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('authentication_role_incorrectRolePermission'))
		})

		it('delete with role client', async function () {
			const additive = await db.models.Additive.create(AdditiveFactory.create())
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${additive.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('authentication_role_incorrectRolePermission'))
		})

		it('delete with role admin - 404', async function () {
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('additive_404'))
		})
	})

	describe('create', async function () {
		describe('create valid', async function () {
			it('with role admin', async function () {
				const data = AdditiveFactory.create()
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(201)
				response.body.should.have.property('id')
				response.body.should.have.property('name').eql(StringUtils.capitalizeFirstLetter(data.name.trim()))
				response.body.should.have.property('price').eql(data.price)
				response.body.should.have.property('createdAt')
				response.body.should.have.property('updatedAt')
			})

			it('with role employee', async function () {
				const data = AdditiveFactory.create()
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(data)
				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})

			it('with role client', async function () {
				const data = AdditiveFactory.create()
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testClientUser.token}`)
					.send(data)
				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
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
					response.body.errors.map(error => error.path).should.eql(['name', 'price'])
				})
			})

			describe('sql', async function () {
				it('duplicate name entry', async function () {
					const additive1 = await db.models.Additive.create(AdditiveFactory.create())
					const data = AdditiveFactory.create()
					data.name = additive1.name

					const response = await chai
						.request(app)
						.post(`${routePrefix}`)
						.set('Authorization', `Bearer ${testAdminUser.token}`)
						.send(data)
					response.should.have.status(422)
					response.body.errors.map(error => error.path).should.eql(['name'])
				})

				it('null name and null price', async function () {
					const data = {}
					try {
						await db.models.Additive.create(data)
					} catch (error) {
						error.errors.map(err => err.path).should.eql(['name', 'price'])
					}
				})
			})
		})
	})

	describe('update', function () {
		describe('update valid', async function () {
			it('with role admin', async function () {
				const additive = await db.models.Additive.create(AdditiveFactory.create())
				const data = {
					name: 'updatedName',
					price: 12.0,
				}
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${additive.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(200)
				response.body.should.have.property('id').eql(additive.id)
				response.body.should.have
					.property('name')
					.eql(StringUtils.capitalizeFirstLetter(data.name.trim().toLowerCase()))
				response.body.should.have.property('price').eql(data.price)
				response.body.should.have.property('createdAt')
				response.body.should.have.property('updatedAt')
			})

			it('with role employee', async function () {
				const additive = await db.models.Additive.create(AdditiveFactory.create())
				const data = {
					name: 'updatedName',
					price: 12.0,
				}
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${additive.id}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(data)

				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})

			it('with role lient', async function () {
				const additive = await db.models.Additive.create(AdditiveFactory.create())
				const data = {
					name: 'updatedName',
					price: 12.0,
				}
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${additive.id}`)
					.set('Authorization', `Bearer ${testClientUser.token}`)
					.send(data)

				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})
		})
	})
})
