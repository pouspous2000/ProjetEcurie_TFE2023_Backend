import { describe, it, beforeEach, afterEach } from 'mocha'

import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'

import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { HorseContributorJobFactory } from '@/modules/horse-contributor-job/factory'

import { StringUtils } from '@/utils/StringUtils'
import i18next from '../../../i18n'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/horse_contributor_jobs'

describe('HorseContributorJob module', function () {
	let roleAdmin, roleEmployee, roleClient
	let testAdminUser, testEmployeeUser, testClientUser

	beforeEach(async function () {
		await db.models.HorseContributorJob.destroy({ truncate: { cascade: true } })
		await db.models.User.destroy({ truncate: { cascade: true } })
		await db.models.Role.destroy({ truncate: { cascade: true } })

		//create roles
		roleAdmin = await db.models.Role.create(RoleFactory.createAdmin())
		roleEmployee = await db.models.Role.create(RoleFactory.createEmployee())
		roleClient = await db.models.Role.create(RoleFactory.createClient())

		//create users
		testAdminUser = await db.models.User.create(UserFactory.create(roleAdmin.id, true))
		testEmployeeUser = await db.models.User.create(UserFactory.create(roleEmployee.id, true))
		testClientUser = await db.models.User.create(UserFactory.create(roleClient.id, true))

		//generate tokens
		testAdminUser.token = testAdminUser.generateToken()
		testEmployeeUser.token = testEmployeeUser.generateToken()
		testClientUser.token = testClientUser.generateToken()
	})

	afterEach(function () {
		roleAdmin = roleEmployee = roleClient = undefined
		testAdminUser = testEmployeeUser = testClientUser = undefined
	})

	describe('index', async function () {
		let hcjs

		beforeEach(async function () {
			hcjs = await db.models.HorseContributorJob.bulkCreate(HorseContributorJobFactory.bulkCreate(10))
		})

		afterEach(function () {
			hcjs = undefined
		})

		it('with role admin', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.length(hcjs.length)
		})

		it('with role employee', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)

			response.should.have.status(200)
			response.body.should.have.length(hcjs.length)
		})

		it('with role client', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)

			response.should.have.status(200)
			response.body.should.have.length(hcjs.length)
		})
	})

	describe('show', async function () {
		let hcj

		beforeEach(async function () {
			hcj = await db.models.HorseContributorJob.create(HorseContributorJobFactory.create())
		})

		afterEach(function () {
			hcj = undefined
		})

		it('with role admin', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${hcj.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(200)
			response.body.should.have.property('id').eql(hcj.id)
			response.body.should.have.property('name').eql(hcj.name)
			response.body.should.have.property('createdAt').not.eql(null)
			response.body.should.have.property('updatedAt').not.eql(null)
		})

		it('with role employee', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${hcj.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
		})

		it('with role client', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${hcj.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(200)
		})

		it('404', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${hcj.id + 1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('horseContributorJob_404'))
		})
	})

	describe('delete', async function () {
		let hcj

		beforeEach(async function () {
			hcj = await db.models.HorseContributorJob.create(HorseContributorJobFactory.create())
		})

		afterEach(function () {
			hcj = undefined
		})

		describe('permissions', async function () {
			it('with role admin', async function () {
				let response = await chai
					.request(app)
					.delete(`${routePrefix}/${hcj.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.should.have.status(204)
				const deletedHcj = await db.models.HorseContributorJob.findByPk(hcj.id)
				chai.should().equal(deletedHcj, null)
			})

			it('with role employee', async function () {
				let response = await chai
					.request(app)
					.delete(`${routePrefix}/${hcj.id}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
				response.should.have.status(204)
			})

			it('with role client', async function () {
				let response = await chai
					.request(app)
					.delete(`${routePrefix}/${hcj.id}`)
					.set('Authorization', `Bearer ${testClientUser.token}`)
				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})
		})

		it('404', async function () {
			let response = await chai
				.request(app)
				.delete(`${routePrefix}/${hcj.id + 1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('horseContributorJob_404'))
		})
	})

	describe('create', async function () {
		describe('permissions', async function () {
			let data

			beforeEach(function () {
				data = HorseContributorJobFactory.create()
			})

			afterEach(function () {
				data = undefined
			})

			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.send(data)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.should.have.status(201)
				response.body.should.have.property('id')
				response.body.should.have
					.property('name')
					.eql(StringUtils.capitalizeFirstLetter(data.name.toLowerCase()))
				response.body.should.have.property('createdAt').not.eql(null)
				response.body.should.have.property('updatedAt').not.eql(null)
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.send(data)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
				response.should.have.status(201)
			})

			it('with role client', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.send(data)
					.set('Authorization', `Bearer ${testClientUser.token}`)
				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})
		})

		describe('middleware', async function () {
			it('null mandatory values - name', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})

				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['name'])
			})
		})

		describe('sql', async function () {
			it('duplicate name entry', async function () {
				const data = HorseContributorJobFactory.createVeterinary()
				await db.models.HorseContributorJob.create(data)

				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['name'])
			})
		})
	})

	describe('update', async function () {
		let hcj

		beforeEach(async function () {
			hcj = await db.models.HorseContributorJob.create(HorseContributorJobFactory.create())
		})

		afterEach(function () {
			hcj = undefined
		})

		it('404', async function () {
			const response = await chai
				.request(app)
				.put(`${routePrefix}/${hcj.id + 1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send({ name: 'something in the way' })

			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('horseContributorJob_404'))
		})

		describe('permissions', async function () {
			let data

			beforeEach(function () {
				data = {
					name: 'Updatedname',
				}
			})

			afterEach(function () {
				data = undefined
			})

			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${hcj.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(200)
				response.body.should.have.property('id').eql(hcj.id)
				response.body.should.have
					.property('name')
					.eql(StringUtils.capitalizeFirstLetter(data.name.toLowerCase()))
				response.body.should.have.property('createdAt').not.eql(null)
				response.body.should.have.property('updatedAt').not.eql(null)
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${hcj.id}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(data)

				response.should.have.status(200)
			})

			it('with role client', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${hcj.id}`)
					.set('Authorization', `Bearer ${testClientUser.token}`)
					.send(data)

				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})
		})

		describe('middleware', async function () {
			it('null mandatory values - name', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${hcj.id + 1}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})

				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['name'])
			})
		})
	})
})
