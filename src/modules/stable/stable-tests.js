import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import { StableFactory } from '@/modules/stable/factory'

import app from '@/app'
import db from '@/database'
import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import i18next from '../../../i18n'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/stables'

describe('Stable Module', function () {
	let testAdminUser, testEmployeeUser, testClientUser
	let roleAdmin, roleEmployee, roleClient

	beforeEach(async function () {
		await db.models.PensionData.destroy({ truncate: { cascade: true } })
		await db.models.Stable.destroy({ truncate: { cascade: true } })
		await db.models.User.destroy({ truncate: { cascade: true } })
		await db.models.Role.destroy({ truncate: { cascade: true } })

		// create roles
		roleAdmin = await db.models.Role.create(RoleFactory.createAdmin())
		roleEmployee = await db.models.Role.create(RoleFactory.createEmployee())
		roleClient = await db.models.Role.create(RoleFactory.createClient())

		// create users
		testAdminUser = await db.models.User.create(UserFactory.create(roleAdmin.id))
		testEmployeeUser = await db.models.User.create(UserFactory.create(roleEmployee.id))
		testClientUser = await db.models.User.create(UserFactory.create(roleClient.id))

		// generate token
		testAdminUser.token = await testAdminUser.generateToken()
		testEmployeeUser.token = await testEmployeeUser.generateToken()
		testClientUser.token = await testClientUser.generateToken()
	})

	afterEach(function () {
		testAdminUser = testEmployeeUser = testClientUser = undefined
		roleAdmin = roleEmployee = roleClient = undefined
	})

	describe('show', function () {
		let stable

		beforeEach(async function () {
			stable = await db.models.Stable.create(StableFactory.createBonnet())
		})

		afterEach(function () {
			stable = undefined
		})

		describe('permissions', async function () {
			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}/${stable.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(200)
				response.body.should.have.property('id').eql(stable.id)
				response.body.should.have.property('name').eql(stable.name)
				response.body.should.have.property('vat').eql(stable.vat)
				response.body.should.have.property('address').eql(stable.address)
				response.body.should.have.property('iban').eql(stable.iban)
				response.body.should.have.property('phone').eql(stable.phone)
				response.body.should.have.property('email').eql(stable.email)
				response.body.should.have.property('invoicePrefix').eql(stable.invoicePrefix)
				response.body.should.have.property('createdAt').not.null
				response.body.should.have.property('updatedAt').not.null
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}/${stable.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(200)
			})

			it('with role client', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}/${stable.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(200)
			})
		})

		it('404', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${stable.id + 1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('stable_404'))
		})
	})

	describe('update', function () {
		let stable, data

		beforeEach(async function () {
			stable = await db.models.Stable.create(StableFactory.createBonnet())
			data = {
				name: 'updated',
				vat: 'BE0123456788',
				phone: '+32(0)494.91.08.90',
				email: 'ecurie.bonnet.updated@gmail.com',
				address: '1A rue du Chaumont, 1460 Ittre updated',
				iban: 'BE68539007547035',
				invoicePrefix: 'prefix',
			}
		})

		afterEach(function () {
			stable = undefined
			data = undefined
		})

		describe('permissions', async function () {
			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${stable.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)
				response.should.have.status(200)
				response.body.should.have.property('id').eql(stable.id)
				response.body.should.have.property('name').eql(data.name)
				response.body.should.have.property('vat').eql(data.vat)
				response.body.should.have.property('address').eql(data.address)
				response.body.should.have.property('iban').eql(data.iban)
				response.body.should.have.property('phone').eql(data.phone)
				response.body.should.have.property('email').eql(data.email)
				response.body.should.have.property('invoicePrefix').eql(data.invoicePrefix)
				response.body.should.have.property('createdAt').not.null
				response.body.should.have.property('updatedAt').not.null
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${stable.id}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(data)

				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})

			it('with role client', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${stable.id}`)
					.set('Authorization', `Bearer ${testClientUser.token}`)
					.send(data)

				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})
		})

		it('404', async function () {
			const response = await chai
				.request(app)
				.put(`${routePrefix}/${stable.id + 1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(data)
			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('stable_404'))
		})

		describe('middleware', async function () {
			it('null mandatory values', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${stable.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})
				response.should.have.status(422)
				response.body.errors
					.map(error => error.path)
					.should.eql(['name', 'vat', 'address', 'iban', 'phone', 'email'])
			})
		})
	})
})
