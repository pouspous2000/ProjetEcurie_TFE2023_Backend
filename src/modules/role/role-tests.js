import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import i18next from '../../../i18n'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/roles'

describe('Role Module', function () {
	let roleAdmin, roleEmployee, roleClient
	let testAdminUser, testEmployeeUser, testClientUser

	beforeEach(async function () {
		await db.models.User.destroy({ truncate: { cascade: true } })
		await db.models.Role.destroy({ truncate: { cascade: true } })

		// create roles
		roleAdmin = await db.models.Role.create(RoleFactory.createAdmin())
		roleEmployee = await db.models.Role.create(RoleFactory.createEmployee())
		roleClient = await db.models.Role.create(RoleFactory.createClient())

		// create users
		testAdminUser = await db.models.User.create(UserFactory.create(roleAdmin.id, true))
		testEmployeeUser = await db.models.User.create(UserFactory.create(roleEmployee.id, true))
		testClientUser = await db.models.User.create(UserFactory.create(roleClient.id, true))

		// generate tokens
		testAdminUser.token = testAdminUser.generateToken()
		testEmployeeUser.token = testEmployeeUser.generateToken()
		testClientUser.token = testClientUser.generateToken()
	})

	afterEach(function () {
		roleAdmin = roleEmployee = roleClient = undefined
		testAdminUser = testEmployeeUser = testClientUser = undefined
	})

	describe('index', async function () {
		it('with role admin', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(3)
		})

		it('with role employee', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(3)
		})

		it('with role client', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(3)
		})
	})

	describe('show', async function () {
		it('with role admin', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${roleAdmin.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.property('id').eql(roleAdmin.id)
			response.body.should.have.property('name').eql(roleAdmin.name)
			response.body.should.have.property('isEditable').eql(false)
			response.body.should.have.property('parent').eql({})
			response.body.should.have.property('children').eql([])
			response.body.should.have.property('createdAt')
			response.body.should.have.property('updatedAt')
		})

		it('with role employee', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${roleAdmin.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)

			response.should.have.status(200)
		})

		it('with role client', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${roleAdmin.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)

			response.should.have.status(200)
		})
	})

	describe('delete', async function () {
		let testRoleAdmin, testRoleEmployee, testRoleClient

		beforeEach(async function () {
			// create subroles
			testRoleAdmin = await db.models.Role.create(RoleFactory.create(roleAdmin.id))
			testRoleEmployee = await db.models.Role.create(RoleFactory.create(roleEmployee.id))
			testRoleClient = await db.models.Role.create(RoleFactory.create(roleClient.id))

			// create associated users
			await db.models.User.create(UserFactory.create(testRoleAdmin.id))
			await db.models.User.create(UserFactory.create(testRoleEmployee.id))
			await db.models.User.create(UserFactory.create(testRoleClient.id))
		})

		afterEach(function () {
			testRoleAdmin = testRoleEmployee = testRoleClient = undefined
		})

		it('with role admin - 404', async function () {
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${testRoleClient.id + 1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('role_404'))
		})

		describe('permissions', async function () {
			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${testRoleAdmin.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(204)
			})

			describe('with role employee', async function () {
				it('delete role admin - not allowed', async function () {
					const response = await chai
						.request(app)
						.delete(`${routePrefix}/${testRoleAdmin.id}`)
						.set('Authorization', `Bearer ${testEmployeeUser.token}`)

					response.should.have.status(401)
					response.body.should.have.property('message').eql(i18next.t('role_401'))
				})

				it('delete role employee - not allowed', async function () {
					const response = await chai
						.request(app)
						.delete(`${routePrefix}/${testRoleEmployee.id}`)
						.set('Authorization', `Bearer ${testEmployeeUser.token}`)

					response.should.have.status(401)
					response.body.should.have.property('message').eql(i18next.t('role_401'))
				})

				it('delete role client - allowed', async function () {
					const response = await chai
						.request(app)
						.delete(`${routePrefix}/${testRoleClient.id}`)
						.set('Authorization', `Bearer ${testEmployeeUser.token}`)

					response.should.have.status(204)
				})
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${testRoleClient.id}`)
					.set('Authorization', `Bearer ${testClientUser.token}`)

				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})
		})

		describe('(not)deletable', async function () {
			it('delete isEditable - allowed', async function () {
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${testRoleClient.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.should.have.status(204)
			})

			it('delete not isEditable - not allowed', async function () {
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${roleEmployee.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.should.have.status(401)
				response.body.should.have.property('message').eql(i18next.t('role_crud_record_unauthorized'))
			})
		})

		describe('cascade delete', async function () {
			it('with role admin but does not matter', async function () {
				const testRole3dlvl = await db.models.Role.create(RoleFactory.create(testRoleClient.id))

				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${testRole3dlvl.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(204)
				const updatedRole3dlvl = await db.models.Role.findByPk(testRole3dlvl.id)
				const should = chai.should()
				should.equal(updatedRole3dlvl, null)
			})
		})
	})

	describe('create', async function () {
		describe('permissions', async function () {
			it('with role admin', async function () {
				const data = RoleFactory.create(roleClient.id)
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)
				response.should.have.status(201)
				response.body.should.have.property('id')
				response.body.should.have.property('name').eql(data.name)
				response.body.should.have.property('parentId').eql(data.parentId)
				response.body.should.have.property('isEditable').eql(true)
				response.body.should.have.property('createdAt')
				response.body.should.have.property('updatedAt')
			})

			describe('with role employee', async function () {
				it('create admin subrole - not allowed', async function () {
					const data = RoleFactory.create(roleAdmin.id)
					const response = await chai
						.request(app)
						.post(`${routePrefix}`)
						.set('Authorization', `Bearer ${testEmployeeUser.token}`)
						.send(data)
					response.should.have.status(401)
					response.body.should.have.property('message').eql(i18next.t('role_401'))
				})

				it('create employee subrole - not allowed', async function () {
					const data = RoleFactory.create(roleEmployee.id)
					const response = await chai
						.request(app)
						.post(`${routePrefix}`)
						.set('Authorization', `Bearer ${testEmployeeUser.token}`)
						.send(data)
					response.should.have.status(401)
					response.body.should.have.property('message').eql(i18next.t('role_401'))
				})

				it('create client subrole - allowed', async function () {
					const data = RoleFactory.create(roleClient.id)
					const response = await chai
						.request(app)
						.post(`${routePrefix}`)
						.set('Authorization', `Bearer ${testEmployeeUser.token}`)
						.send(data)
					response.should.have.status(201)
				})
			})

			it('with role client', async function () {
				const data = RoleFactory.create(roleClient.id)
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

		describe('middleware', async function () {
			it('check middleware rules are applied', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})

				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['parentId', 'name'])
			})
		})

		describe('sql', async function () {
			it('duplicate name', async function () {
				const data = {
					name: 'CLIENT',
					parentId: roleClient.id,
				}
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['name'])
			})
		})

		describe('service', async function () {
			it('check inexisting parentRole', async function () {
				const lastRole = await db.models.Role.findOne({ order: [['id', 'DESC']] })
				const data = RoleFactory.create(lastRole.id + 1)
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('role_422_inexistingParentRole'))
			})
		})
	})

	describe('update', async function () {
		let testRoleAdmin, testRoleEmployee, testRoleClient

		beforeEach(async function () {
			// create subroles
			testRoleAdmin = await db.models.Role.create(RoleFactory.create(roleAdmin.id))
			testRoleEmployee = await db.models.Role.create(RoleFactory.create(roleEmployee.id))
			testRoleClient = await db.models.Role.create(RoleFactory.create(roleClient.id))

			// create associated users
			await db.models.User.create(UserFactory.create(testRoleAdmin.id))
			await db.models.User.create(UserFactory.create(testRoleEmployee.id))
			await db.models.User.create(UserFactory.create(testRoleClient.id))
		})

		afterEach(function () {
			testRoleAdmin = testRoleEmployee = testRoleClient = undefined
		})

		describe('permissions', async function () {
			it('with role admin', async function () {
				const data = {
					parentId: testRoleClient.parentId,
					name: 'Updated',
				}

				const response = await chai
					.request(app)
					.put(`${routePrefix}/${testRoleClient.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(200)
				response.body.should.have.property('id').eql(testRoleClient.id)
				response.body.should.have.property('name').eql(data.name)
				response.body.should.have.property('parentId').eql(data.parentId)
				response.body.should.have.property('isEditable').eql(true)
				response.body.should.have.property('createdAt')
				response.body.should.have.property('updatedAt')
			})

			describe('with role employee', async function () {
				it('update admin subrole - not allowed', async function () {
					const data = {
						parentId: testRoleAdmin.parentId,
						name: 'Updated',
					}

					const response = await chai
						.request(app)
						.put(`${routePrefix}/${testRoleAdmin.id}`)
						.set('Authorization', `Bearer ${testEmployeeUser.token}`)
						.send(data)

					response.should.have.status(401)
					response.body.should.have.property('message').eql(i18next.t('role_401'))
				})

				it('update employee subrole - not allowed', async function () {
					const data = {
						parentId: testRoleEmployee.parentId,
						name: 'Updated',
					}

					const response = await chai
						.request(app)
						.put(`${routePrefix}/${testRoleEmployee.id}`)
						.set('Authorization', `Bearer ${testEmployeeUser.token}`)
						.send(data)

					response.should.have.status(401)
					response.body.should.have.property('message').eql(i18next.t('role_401'))
				})

				it('update client subrole - allowed', async function () {
					const data = {
						parentId: testRoleClient.parentId,
						name: 'Updated',
					}

					const response = await chai
						.request(app)
						.put(`${routePrefix}/${testRoleClient.id}`)
						.set('Authorization', `Bearer ${testEmployeeUser.token}`)
						.send(data)

					response.should.have.status(200)
				})
			})

			it('with role client', async function () {
				const data = {
					parentId: testRoleClient.parentId,
					name: 'Updated',
				}

				const response = await chai
					.request(app)
					.put(`${routePrefix}/${testRoleClient.id}`)
					.set('Authorization', `Bearer ${testClientUser.token}`)
					.send(data)

				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})
		})

		describe('middleware', async function () {
			it('check middleware rules are applied', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${testRoleClient.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})

				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['parentId', 'name'])
			})
		})

		describe('service', async function () {
			it('impossible to update isEditable false role', async function () {
				const data = {
					parentId: 1,
					name: 'Updated',
				}

				const response = await chai
					.request(app)
					.put(`${routePrefix}/${roleClient.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('role_crud_record_unauthorized'))
			})

			it('check inexisting parentRole', async function () {
				const lastRole = await db.models.Role.findOne({ order: [['id', 'DESC']] })

				const data = {
					parentId: lastRole.id + 1,
					name: 'Updated',
				}

				const response = await chai
					.request(app)
					.put(`${routePrefix}/${lastRole.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('role_422_inexistingParentRole'))
			})
		})
	})
})
