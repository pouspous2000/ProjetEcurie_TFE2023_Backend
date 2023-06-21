import { describe, it, beforeEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import i18next from '../../../i18n'
import { UserFactory } from '@/modules/authentication/factory'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/authentication'

describe('Authentication module', function () {
	beforeEach(async function () {
		await db.models.User.destroy({ truncate: true })
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
		const cecile = UserFactory.createCecile()
		await db.models.User.create(cecile)

		const response = await chai.request(app).post(`${routePrefix}/register`).send({
			email: cecile.email,
			password: cecile.password,
			passwordConfirm: cecile.password,
		})

		response.should.have.status(422)
		response.body.errors.should.have.length(1)
		response.body.errors[0].should.have.property('path').eql('email')
		response.body.errors[0].errors.should.have.length(1)
	})

	// confirm
	it('confirm valid', async function () {
		const userObj = UserFactory.create()
		await db.models.User.create(userObj)
		const response = await chai.request(app).get(`${routePrefix}/confirm/${userObj.confirmationCode}`)
		response.should.have.status(200)
	})

	it('confirm invalid - 404', async function () {
		const response = await chai.request(app).get(`${routePrefix}/confirm/${'inexistingConfirmationCode'}`)
		response.should.have.status(404)
	})

	it('confirm invalid - already active user', async function () {
		const cecile = await db.models.User.create(UserFactory.createCecile())
		const response = await chai.request(app).get(`${routePrefix}/confirm/${cecile.confirmationCode}`)
		response.should.have.status(422) // j'ai une 404 au lieu d'une 422 => à vérifier p e moi qui déconne
		response.body.should.have.property('message').eql(i18next.t('authentication_already_confirmed'))
	})

	// login
	it('login valid', async function () {
		const cecileObj = UserFactory.createCecile()
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
		const cecileObj = UserFactory.createCecile()
		await db.models.User.create(cecileObj)
		const response = await chai.request(app).post(`${routePrefix}/login`).send({
			email: cecileObj.email,
			password: 'wrong password',
		})
		response.should.have.status(400)
		response.body.should.have.property('message').eql(i18next.t('authentication_login_password_invalid'))
	})

	it('login invalid - not confirmed user', async function () {
		const userObj = UserFactory.create()
		await db.models.User.create(userObj)
		const response = await chai.request(app).post(`${routePrefix}/login`).send({
			email: userObj.email.toLowerCase(),
			password: userObj.password,
		})
		response.should.have.status(400)
		response.body.should.have.property('message').eql(i18next.t('authentication_login_user_unconfirmed'))
	})
})
