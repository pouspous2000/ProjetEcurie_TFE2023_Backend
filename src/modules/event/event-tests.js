import { describe, it, beforeEach, afterEach } from 'mocha'
import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '@/app'
import db from '@/database'

import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { ContactFactory } from '@/modules/contact/factory'

import i18next from '../../../i18n'
import { StringUtils } from '@/utils/StringUtils'
import { Eventfactory } from '@/modules/event/factory'
import { ArrayUtils } from '@/utils/ArrayUtils'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/events'

describe('Event module', function () {
	let roleAdmin, roleEmployee, roleClient
	let testAdminUser, testEmployeeUser1, testEmployeeUser2, testClientUser1, testClientUser2
	// eslint-disable-next-line no-unused-vars
	let testAdminContact, testEmployeeContact1, testEmployeeContact2, testClientContact1, testClientContact2

	beforeEach(async function () {
		await db.models.Event.destroy({ truncate: { cascade: true } })
		await db.models.Contact.destroy({ truncate: { cascade: true } })
		await db.models.User.destroy({ truncate: { cascade: true } })
		await db.models.Role.destroy({ truncate: { cascade: true } })

		//create roles
		roleAdmin = await db.models.Role.create(RoleFactory.createAdmin())
		roleEmployee = await db.models.Role.create(RoleFactory.createEmployee())
		roleClient = await db.models.Role.create(RoleFactory.createClient())

		//create users
		testAdminUser = await db.models.User.create(UserFactory.create(roleAdmin.id, true))
		testEmployeeUser1 = await db.models.User.create(UserFactory.create(roleEmployee.id, true))
		testEmployeeUser2 = await db.models.User.create(UserFactory.create(roleEmployee.id, true))
		testClientUser1 = await db.models.User.create(UserFactory.create(roleClient.id, true))
		testClientUser2 = await db.models.User.create(UserFactory.create(roleClient.id, true))

		//generate tokens
		testAdminUser.token = testAdminUser.generateToken()
		testEmployeeUser1.token = testEmployeeUser1.generateToken()
		testEmployeeUser2.token = testEmployeeUser2.generateToken()
		testClientUser1.token = testClientUser1.generateToken()
		testClientUser2.token = testClientUser2.generateToken()

		//create contacts
		testAdminContact = await db.models.Contact.create(ContactFactory.create(testAdminUser.id))
		testEmployeeContact1 = await db.models.Contact.create(ContactFactory.create(testEmployeeUser1.id))
		testEmployeeContact2 = await db.models.Contact.create(ContactFactory.create(testEmployeeUser2.id))
		testClientContact1 = await db.models.Contact.create(ContactFactory.create(testClientUser1.id))
		testClientContact2 = await db.models.Contact.create(ContactFactory.create(testClientUser2.id))
	})

	afterEach(function () {
		roleAdmin = roleEmployee = roleClient = undefined
		testAdminUser = testEmployeeUser1 = testEmployeeUser2 = testClientUser1 = testClientUser2 = undefined
		testAdminContact =
			testEmployeeContact1 =
			testEmployeeContact2 =
			testClientContact1 =
			testClientContact2 =
				undefined
	})

	describe('index', async function () {
		it('with role admin', async function () {
			const events = []
			for (let i = 0; i < 10; i++) {
				events.push(
					await db.models.Event.create(
						Eventfactory.create(
							ArrayUtils.getRandomElement([testAdminUser.id, testEmployeeUser1.id, testEmployeeUser2.id])
						)
					)
				)
			}
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.length(events.length)
		})

		it('with role employee', async function () {
			const events = []
			for (let i = 0; i < 10; i++) {
				events.push(
					await db.models.Event.create(
						Eventfactory.create(
							ArrayUtils.getRandomElement([testAdminUser.id, testEmployeeUser1.id, testEmployeeUser2.id])
						)
					)
				)
			}
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser1.token}`)

			response.should.have.status(200)
			response.body.should.have.length(events.length)
		})

		it('with role client', async function () {
			const events = []
			for (let i = 0; i < 10; i++) {
				events.push(
					await db.models.Event.create(
						Eventfactory.create(
							ArrayUtils.getRandomElement([testAdminUser.id, testEmployeeUser1.id, testEmployeeUser2.id])
						)
					)
				)
			}
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testClientUser1.token}`)

			response.should.have.status(200)
			response.body.should.have.length(events.length)
		})

		describe('query parameters', async function () {
			it('validation of query params - middleware', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({ creatorId: -1, startingAt: 'now', endingAt: 'now', participants: [-1] })
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.should.have.status(422)
				response.body.errors
					.map(error => error.path)
					.should.eql(['creatorId', 'participants', 'startingAt', 'endingAt'])
			})

			it('test on queryParameters', async function () {
				const event = await db.models.Event.create(Eventfactory.create(testEmployeeUser1.id))
				await event.setParticipants([testClientUser1.id])
				let response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						creatorId: event.creatorId + 1,
						startingAt: event.startingAt,
						endingAt: event.endingAt,
						participants: [testClientUser1.id],
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)

				const startingAtDate = new Date(event.startingAt)
				startingAtDate.setSeconds(startingAtDate.getSeconds() + 1)
				const formattingStartingDate = startingAtDate.toISOString()

				const endingAtDate = new Date(event.endingAt)
				endingAtDate.setSeconds(startingAtDate.getSeconds() - 1)
				const formattingEndingDate = startingAtDate.toISOString()

				response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						creatorId: event.creatorId,
						startingAt: formattingStartingDate,
						endingAt: event.endingAt,
						participants: [testClientUser1.id],
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)

				response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						creatorId: event.creatorId,
						startingAt: event.startingAt,
						endingAt: formattingEndingDate,
						participants: [testClientUser1.id],
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)

				response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						creatorId: event.creatorId,
						startingAt: event.startingAt,
						endingAt: event.endingAt,
						participants: [testClientUser1.id + 1],
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)

				response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						creatorId: event.creatorId,
						startingAt: event.startingAt,
						endingAt: event.endingAt,
						participants: [testClientUser1.id],
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(1)
			})
		})
	})

	describe('show', async function () {
		it('with role admin', async function () {
			const event = await db.models.Event.create(Eventfactory.create(testEmployeeUser1.id))
			await event.setParticipants([testClientUser1.id])

			const response = await chai
				.request(app)
				.get(`${routePrefix}/${event.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.property('id').eql(event.id)
			response.body.should.have
				.property('name')
				.eql(StringUtils.capitalizeFirstLetter(event.name.toLowerCase().trim()))
			response.body.should.have.property('description').eql(event.description.trim())
			response.body.should.have.property('creator').eql({
				userId: testEmployeeUser1.id,
				firstName: testEmployeeContact1.firstName,
				lastName: testEmployeeContact1.lastName,
				phone: testEmployeeContact1.phone,
				mobile: testEmployeeContact1.mobile,
			})
			response.body.participants[0].should.eql({
				email: testClientUser1.email,
				userId: testClientUser1.id,
				firstName: testClientContact1.firstName,
				lastName: testClientContact1.lastName,
				phone: testClientContact1.phone,
				mobile: testClientContact1.mobile,
				address: testClientContact1.address,
			})
			new Date(response.body.startingAt).getTime().should.eql(new Date(event.startingAt).getTime())
			new Date(response.body.endingAt).getTime().should.eql(new Date(event.endingAt).getTime())
			response.body.should.have.property('createdAt')
			response.body.should.have.property('updatedAt')
		})

		it('with role employee', async function () {
			const event = await db.models.Event.create(Eventfactory.create(testEmployeeUser1.id))
			await event.setParticipants([testClientUser1.id])

			const response = await chai
				.request(app)
				.get(`${routePrefix}/${event.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser2.token}`)

			response.should.have.status(200)
		})

		it('with role client', async function () {
			const event = await db.models.Event.create(Eventfactory.create(testEmployeeUser1.id))
			await event.setParticipants([testClientUser1.id])

			const response = await chai
				.request(app)
				.get(`${routePrefix}/${event.id}`)
				.set('Authorization', `Bearer ${testClientUser1.token}`)

			response.should.have.status(200)
		})

		it('with role admin - 404', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${1}`)
				.set('Authorization', `Bearer ${testClientUser1.token}`)
			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('event_404'))
		})
	})
})
