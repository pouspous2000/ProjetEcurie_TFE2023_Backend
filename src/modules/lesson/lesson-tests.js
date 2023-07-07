import { describe, it, beforeEach, afterEach } from 'mocha'
import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '@/app'
import db from '@/database'

import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { ContactFactory } from '@/modules/contact/factory'

import i18next from '../../../i18n'
import { LessonFactory } from '@/modules/lesson/factory'

chai.should()
chai.use(chaiHttp)
const routePrefix = '/lessons'

describe('Lesson module', function () {
	let roleAdmin, roleEmployee, roleClient
	let testAdminUser, testEmployeeUser1, testEmployeeUser2, testClientUser1, testClientUser2
	// eslint-disable-next-line no-unused-vars
	let testAdminContact, testEmployeeContact1, testEmployeeContact2, testClientContact1, testClientContact2

	beforeEach(async function () {
		await db.models.Lesson.destroy({ truncate: { cascade: true } })
		await db.models.Contact.destroy({ truncate: { cascade: true } })
		await db.models.User.destroy({ truncate: { cascade: true } })
		await db.models.Role.destroy({ truncate: { cascade: true } })

		// create roles
		roleAdmin = await db.models.Role.create(RoleFactory.createAdmin())
		roleEmployee = await db.models.Role.create(RoleFactory.createEmployee())
		roleClient = await db.models.Role.create(RoleFactory.createClient())

		// create users
		testAdminUser = await db.models.User.create(UserFactory.create(roleAdmin.id, true))
		testEmployeeUser1 = await db.models.User.create(UserFactory.create(roleEmployee.id, true))
		testEmployeeUser2 = await db.models.User.create(UserFactory.create(roleEmployee.id, true))
		testClientUser1 = await db.models.User.create(UserFactory.create(roleClient.id, true))
		testClientUser2 = await db.models.User.create(UserFactory.create(roleClient.id, true))

		// generate tokens
		testAdminUser.token = testAdminUser.generateToken()
		testEmployeeUser1.token = testEmployeeUser1.generateToken()
		testEmployeeUser2.token = testEmployeeUser2.generateToken()
		testClientUser1.token = testClientUser1.generateToken()
		testClientUser2.token = testClientUser2.generateToken()

		// create contacts
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
			const lessons = []
			for (let i = 0; i < 10; i++) {
				lessons.push(
					await db.models.Lesson.create(LessonFactory.create(testEmployeeUser1.id, testClientUser1.id))
				)
			}
			for (let i = 0; i < 10; i++) {
				lessons.push(
					await db.models.Lesson.create(LessonFactory.create(testEmployeeUser2.id, testClientUser2.id))
				)
			}

			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.length(lessons.length)
		})
		it('with role employee', async function () {
			const lessonsEmployee1 = []
			for (let i = 0; i < 3; i++) {
				lessonsEmployee1.push(
					await db.models.Lesson.create(LessonFactory.create(testEmployeeUser1.id, testClientUser1.id))
				)
			}
			lessonsEmployee1.push(
				await db.models.Lesson.create(LessonFactory.create(testEmployeeUser1.id, testClientUser2.id))
			)
			await db.models.Lesson.create(LessonFactory.create(testEmployeeUser2.id, testClientUser1.id))

			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser1.token}`)
			response.should.have.status(200)
			response.body.should.have.length(lessonsEmployee1.length)
		})
		it('with role client', async function () {
			const lessonsClient1 = []
			for (let i = 0; i < 3; i++) {
				lessonsClient1.push(
					await db.models.Lesson.create(LessonFactory.create(testEmployeeUser1.id, testClientUser1.id))
				)
			}
			lessonsClient1.push(
				await db.models.Lesson.create(LessonFactory.create(testEmployeeUser2.id, testClientUser1.id))
			)

			await db.models.Lesson.create(LessonFactory.create(testEmployeeUser2.id, testClientUser2.id))
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testClientUser1.token}`)
			response.should.have.status(200)
			response.body.should.have.length(lessonsClient1.length)
		})
		describe('query parameters', async function () {
			it('validation of query params - middleware', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({ creatorId: -1, clientId: -1, startingAt: 'now', status: 'UNDEFINED' })
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(422)
				response.body.errors
					.map(error => error.path)
					.should.eql(['creatorId', 'clientId', 'status', 'startingAt'])
			})
			it('test on queryParameters', async function () {
				const lesson = await db.models.Lesson.create(
					LessonFactory.create(testAdminUser.id, testClientUser1.id, 'CONFIRMED')
				)

				let response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						creatorId: lesson.creatorId + 1,
						clientId: lesson.clientId,
						startingAt: lesson.startingAt,
						status: lesson.status,
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)

				response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						creatorId: lesson.creatorId,
						clientId: lesson.clientId + 1,
						startingAt: lesson.startingAt,
						status: lesson.status,
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)

				const startingAtDate = new Date(lesson.startingAt)
				startingAtDate.setSeconds(startingAtDate.getSeconds() + 1)
				const formattingStartingDate = startingAtDate.toISOString()

				response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						creatorId: lesson.creatorId,
						clientId: lesson.clientId,
						startingAt: formattingStartingDate,
						status: lesson.status,
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)

				response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						creatorId: lesson.creatorId,
						clientId: lesson.clientId,
						startingAt: lesson.startingAt,
						status: lesson.status,
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(1)
			})
		})
	})

	describe('show', async function () {
		it('with role admin', async function () {
			const lesson = await db.models.Lesson.create(LessonFactory.create(testAdminUser.id, testClientUser1.id))
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${lesson.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.property('id').eql(lesson.id)
			response.body.should.have.property('creator').eql({
				userId: testAdminUser.id,
				firstName: testAdminContact.firstName,
				lastName: testAdminContact.lastName,
				phone: testAdminContact.phone,
				mobile: testAdminContact.mobile,
			})
			response.body.should.have.property('client').eql({
				userId: testClientUser1.id,
				firstName: testClientContact1.firstName,
				lastName: testClientContact1.lastName,
				phone: testClientContact1.phone,
				mobile: testClientContact1.mobile,
			})
			new Date(response.body.startingAt).getTime().should.eql(new Date(lesson.startingAt).getTime())
			new Date(response.body.endingAt).getTime().should.eql(new Date(lesson.endingAt).getTime())
			response.body.should.have.property('status').eql(lesson.status)
			response.body.should.have.property('createdAt')
			response.body.should.have.property('updatedAt')
		})
		it('with role employee - own lesson', async function () {
			const lesson = await db.models.Lesson.create(LessonFactory.create(testEmployeeUser1.id, testClientUser1.id))
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${lesson.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser1.token}`)
			response.should.have.status(200)
		})
		it("with role employee - other employee's lesson", async function () {
			const lesson = await db.models.Lesson.create(LessonFactory.create(testEmployeeUser2.id, testClientUser1.id))
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${lesson.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser1.token}`)
			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('lesson_unauthorized'))
		})
		it('with role client - own lesson', async function () {
			const lesson = await db.models.Lesson.create(LessonFactory.create(testAdminUser.id, testClientUser1.id))
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${lesson.id}`)
				.set('Authorization', `Bearer ${testClientUser1.token}`)
			response.should.have.status(200)
		})
		it("with role client - other client's lesson", async function () {
			const lesson = await db.models.Lesson.create(LessonFactory.create(testAdminUser.id, testClientUser1.id))
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${lesson.id}`)
				.set('Authorization', `Bearer ${testClientUser2.token}`)
			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('lesson_unauthorized'))
		})
		it('with role admin - 404', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(404)
		})
	})

	describe('delete', async function () {
		it('with role admin', async function () {
			const lesson = await db.models.Lesson.create(LessonFactory.create(testEmployeeUser1.id, testClientUser1.id))
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${lesson.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(204)
		})

		it('with role employee - own lesson', async function () {
			const lesson = await db.models.Lesson.create(LessonFactory.create(testEmployeeUser1.id, testClientUser1.id))
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${lesson.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser1.token}`)
			response.should.have.status(204)
		})

		it("with role employee - other employee's lesson", async function () {
			const lesson = await db.models.Lesson.create(LessonFactory.create(testEmployeeUser1.id, testClientUser1.id))
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${lesson.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser2.token}`)
			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('lesson_unauthorized'))
		})

		it('with role client', async function () {
			const lesson = await db.models.Lesson.create(LessonFactory.create(testEmployeeUser1.id, testClientUser1.id))
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${lesson.id}`)
				.set('Authorization', `Bearer ${testClientUser1.token}`)
			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('authentication_role_incorrectRolePermission'))
		})
	})

	describe('create', async function () {
		describe('create with valid data', async function () {
			it('with role admin', async function () {
				const data = LessonFactory.create(testAdminUser.id, testClientUser1.id)
				delete data['status']
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(201)
				response.body.should.have.property('id')
				response.body.should.have.property('creator').eql({
					userId: testAdminUser.id,
					firstName: testAdminContact.firstName,
					lastName: testAdminContact.lastName,
					phone: testAdminContact.phone,
					mobile: testAdminContact.mobile,
				})
				response.body.should.have.property('client').eql({
					userId: testClientUser1.id,
					firstName: testClientContact1.firstName,
					lastName: testClientContact1.lastName,
					phone: testClientContact1.phone,
					mobile: testClientContact1.mobile,
				})
				new Date(response.body.startingAt).getTime().should.eql(new Date(data.startingAt).getTime())
				new Date(response.body.endingAt).getTime().should.eql(new Date(data.endingAt).getTime())
				response.body.should.have.property('status').eql('CONFIRMED')
				response.body.should.have.property('createdAt')
				response.body.should.have.property('updatedAt')
			})

			it('with role employee', async function () {
				const data = LessonFactory.create(testEmployeeUser2.id, testClientUser2.id)
				delete data['status']
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testEmployeeUser2.token}`)
					.send(data)

				response.should.have.status(201)
			})

			it('with role client', async function () {
				const data = LessonFactory.create(testEmployeeUser2.id, testClientUser2.id)
				delete data['status']
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testClientUser2.token}`)
					.send(data)

				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})
		})

		describe('create invalid - middleware', async function () {
			it('with role admin but does not matter', async function () {
				const data = {}
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)
				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['clientId', 'startingAt', 'endingAt'])
			})
		})

		describe('create invalid - sql', async function () {
			it('with role admin but does not matter', async function () {
				try {
					await db.models.Lesson.create({})
				} catch (error) {
					error.errors
						.map(err => err.path)
						.should.eql(['creatorId', 'clientId', 'startingAt', 'endingAt', 'status'])
				}
			})
		})
	})
})
