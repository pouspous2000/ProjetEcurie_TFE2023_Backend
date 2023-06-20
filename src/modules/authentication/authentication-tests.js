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
		response.body.errors[0].should.have.property('msg').eql('email must be unique')
	})

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
})
