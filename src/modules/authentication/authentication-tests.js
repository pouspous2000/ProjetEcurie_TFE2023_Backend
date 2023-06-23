import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import i18next from '../../../i18n'
import { UserFactory } from '@/modules/authentication/factory'
import { RoleFactory } from '@/modules/role/factory'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/authentication'

describe('Authentication module', function () {
	let testAdmin, testEmployee, testClient

	beforeEach(async function () {
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

	// register
	it('register valid', async function () {
		const data = {
			email: 'arsene.lupin@gmail.com',
			password: 'password',
			passwordConfirm: 'password',
		}
		const response = await chai.request(app).post(`${routePrefix}/register`).send(data)
		response.should.have.status(201)
		response.body.should.have.property('message').eql(i18next.t('authentication_register_message'))
	})

	it('register invalid - middleware validation', async function () {
		const data = {} // missing password, passwordConfirm, email
		const response = await chai.request(app).post(`${routePrefix}/register`).send(data)
		response.should.have.status(422)
		response.body.errors.should.have.length(3) // email, password, passwordConfirm
	})

	it('register invalid - sql error - non unique mail', async function () {
		const response = await chai.request(app).post(`${routePrefix}/register`).send({
			email: testClient.email,
			password: testClient.password,
			passwordConfirm: testClient.password,
		})

		response.should.have.status(422)
		response.body.errors.should.have.length(1)
		response.body.errors[0].should.have.property('path').eql('email')
		response.body.errors[0].errors.should.have.length(1)
	})

	// register manually
	it('register manually valid', async function () {
		const data = {
			email: 'arsene.lupin@gmail.com',
			password: 'password',
			passwordConfirm: 'password',
			roleId: testEmployee.roleId,
		}
		const response = await chai
			.request(app)
			.post(`${routePrefix}/register-manually`)
			.set('Authorization', `Bearer ${testAdmin.token}`)
			.send(data)
		response.should.have.status(201)
		response.body.should.have.property('message').eql(i18next.t('authentication_registerManually_message'))
	})

	it('register manually invalid - middleware validation', async function () {
		const data = {} // missing password, passwordConfirm, email
		const response = await chai
			.request(app)
			.post(`${routePrefix}/register-manually`)
			.set('Authorization', `Bearer ${testAdmin.token}`)
			.send(data)
		response.should.have.status(422)
		response.body.errors.should.have.length(4) // email, password, passwordConfirm, roleId
	})

	it('register manually valid BUT permission', async function () {
		const data = {
			email: 'arsene.lupin@gmail.com',
			password: 'password',
			passwordConfirm: 'password',
			roleId: testEmployee.roleId,
		}
		const response = await chai
			.request(app)
			.post(`${routePrefix}/register-manually`)
			.set('Authorization', `Bearer ${testClient.token}`)
			.send(data)
		response.should.have.status(401)
	})

	// confirm
	it('confirm valid', async function () {
		const userObj = UserFactory.create(testClient.roleId)
		await db.models.User.create(userObj)
		const response = await chai.request(app).get(`${routePrefix}/confirm/${userObj.confirmationCode}`)
		response.should.have.status(200)
	})

	it('confirm invalid - 404', async function () {
		const response = await chai.request(app).get(`${routePrefix}/confirm/${'inexistingConfirmationCode'}`)
		response.should.have.status(404)
	})

	it('confirm invalid - already active user', async function () {
		const response = await chai.request(app).get(`${routePrefix}/confirm/${testClient.confirmationCode}`)
		response.should.have.status(422) // j'ai une 404 au lieu d'une 422 => à vérifier p e moi qui déconne
		response.body.should.have.property('message').eql(i18next.t('authentication_already_confirmed'))
	})

	// login
	it('login valid', async function () {
		const cecileObj = UserFactory.createCecile(testClient.roleId)
		await db.models.User.create(cecileObj)
		const response = await chai.request(app).post(`${routePrefix}/login`).send({
			email: cecileObj.email,
			password: cecileObj.password,
		})
		response.should.have.status(200)
		response.body.should.have.property('token')
		response.body.should.have.property('refreshToken')
	})

	it('login invalid - validation middleware', async function () {
		const response = await chai.request(app).post(`${routePrefix}/login`).send({})
		response.should.have.status(422)
		response.body.errors.should.have.length(2) // email and password
	})

	it('login invalid - inexisting email', async function () {
		const response = await chai.request(app).post(`${routePrefix}/login`).send({
			email: 'arsene.lupin@gmail.com',
			password: 'password',
		})
		response.should.have.status(404)
		response.body.should.have.property('message').eql(i18next.t('authentication_404'))
	})

	it('login invalid - wrong password', async function () {
		const cecileObj = UserFactory.createCecile(testClient.roleId)
		await db.models.User.create(cecileObj)
		const response = await chai.request(app).post(`${routePrefix}/login`).send({
			email: cecileObj.email,
			password: 'wrong password',
		})
		response.should.have.status(400)
		response.body.should.have.property('message').eql(i18next.t('authentication_login_password_invalid'))
	})

	it('login invalid - not confirmed user', async function () {
		const userObj = UserFactory.create(testClient.roleId)
		await db.models.User.create(userObj)
		const response = await chai.request(app).post(`${routePrefix}/login`).send({
			email: userObj.email.toLowerCase(),
			password: userObj.password,
		})
		response.should.have.status(400)
		response.body.should.have.property('message').eql(i18next.t('authentication_login_user_unconfirmed'))
	})

	it('delete user', async function () {
		const response = await chai
			.request(app)
			.delete(`${routePrefix}/me`)
			.set('Authorization', `Bearer ${testClient.token}`)
		response.should.have.status(204)
	})

	// we do not want to test invalid data as it is exactly the same than register
	it('update user valid', async function () {
		const response = await chai
			.request(app)
			.put(`${routePrefix}/me`)
			.set('Authorization', `Bearer ${testClient.token}`)
			.send({
				email: 'arsene.lupin@gmail.com',
				password: 'password',
				passwordConfirm: 'password',
			})
		response.should.have.status(200)
		response.body.should.have.property('message').eql(i18next.t('authentication_update_message'))
	})
})
