import { describe, it, beforeEach, afterEach } from 'mocha'
import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '@/app'
import db from '@/database'

import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { ContactFactory } from '@/modules/contact/factory'

import i18next from '../../../i18n'
import { TaskFactory } from '@/modules/task/factory'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/tasks'

describe('Task module', function () {
	let roleAdmin, roleEmployee, roleClient
	let testAdminUser, testEmployeeUser1, testEmployeeUser2, testClientUser
	// eslint-disable-next-line no-unused-vars
	let testAdminContact, testEmployeeContact1, testEmployeeContact2, testClientContact

	beforeEach(async function () {
		await db.models.Contact.destroy({ truncate: { cascade: true } })
		await db.models.User.destroy({ truncate: { cascade: true } })
		await db.models.Role.destroy({ truncate: { cascade: true } })

		//create roles
		roleAdmin = await db.models.Role.create(RoleFactory.createAdmin())
		roleEmployee = await db.models.Role.create(RoleFactory.createEmployee())
		roleClient = await db.models.Role.create(RoleFactory.createClient())

		//create users
		testAdminUser = await db.models.User.create(UserFactory.createTestAdmin(roleAdmin.id))
		testEmployeeUser1 = await db.models.User.create(UserFactory.createTestEmployee(roleEmployee.id))
		testEmployeeUser2 = await db.models.User.create(UserFactory.create(roleEmployee.id, true))
		testClientUser = await db.models.User.create(UserFactory.createTestClient(roleClient.id))

		//create contacts as we fetch the contact in the service
		testAdminContact = await db.models.Contact.create(ContactFactory.create(testAdminUser.id))
		testEmployeeContact1 = await db.models.Contact.create(ContactFactory.create(testEmployeeUser1.id))
		testEmployeeContact2 = await db.models.Contact.create(ContactFactory.create(testEmployeeUser2.id))
		testClientContact = await db.models.Contact.create(ContactFactory.create(testClientUser.id))

		//generate tokens
		testAdminUser.token = testAdminUser.generateToken()
		testEmployeeUser1.token = testEmployeeUser1.generateToken()
		testEmployeeUser2.token = testEmployeeUser2.generateToken()
		testClientUser.token = testClientUser.generateToken()
	})

	afterEach(function () {
		roleAdmin = roleEmployee = roleClient = undefined
		testAdminUser = testEmployeeUser1 = testEmployeeUser2 = testClientUser = undefined
		testAdminContact = testEmployeeContact1 = testEmployeeContact2 = testClientContact = undefined
	})

	describe('index', async function () {
		it('with role admin', async function () {
			const tasks = []
			for (let i = 0; i < 5; i++) {
				tasks.push(await db.models.Task.create(TaskFactory.create(testAdminUser.id, testEmployeeUser1.id)))
			}
			for (let i = 0; i < 5; i++) {
				tasks.push(await db.models.Task.create(TaskFactory.create(testAdminUser.id, testEmployeeUser2.id)))
			}

			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.length(tasks.length)
		})

		it('with role employee', async function () {
			const tasksEmployee1 = []

			for (let i = 0; i < 3; i++) {
				tasksEmployee1.push(
					await db.models.Task.create(TaskFactory.create(testAdminUser.id, testEmployeeUser1.id))
				)
			}
			for (let i = 0; i < 5; i++) {
				await db.models.Task.create(TaskFactory.create(testAdminUser.id, testEmployeeUser2.id))
			}

			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser1.token}`)

			response.should.have.status(200)
			response.body.should.have.length(tasksEmployee1.length)
		})

		it('with role client', async function () {
			await db.models.Task.create(TaskFactory.create(testAdminUser.id, testEmployeeUser1.id))
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)

			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('authentication_role_incorrectRolePermission'))
		})

		describe('query parameters', async function () {
			it('validation of query params - middleware', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({ employeeId: -1, creatorId: -1, startingAt: 'now', status: 'UNDEFINED' })
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(422)
				response.body.errors
					.map(error => error.path)
					.should.eql(['employeeId', 'creatorId', 'status', 'startingAt'])
			})

			it('test on queryParameters', async function () {
				const task = await db.models.Task.create(
					TaskFactory.create(testAdminUser.id, testEmployeeUser1.id, 'PENDING')
				)

				let response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						employeeId: task.employeeId + 1,
						creatorId: task.creatorId,
						startingAt: task.startingAt,
						status: task.status,
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)

				response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						employeeId: task.employeeId,
						creatorId: task.creatorId + 1,
						startingAt: task.startingAt,
						status: task.status,
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)

				const startingAtDate = new Date(task.startingAt)
				startingAtDate.setSeconds(startingAtDate.getSeconds() + 1)
				const formattingStartingDate = startingAtDate.toISOString()

				response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						employeeId: task.employeeId,
						creatorId: task.creatorId,
						startingAt: formattingStartingDate,
						status: task.status,
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)

				response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						employeeId: task.employeeId,
						creatorId: task.creatorId,
						startingAt: task.startingAt,
						status: task.status,
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(1)
			})
		})
	})

	describe('show', async function () {
		it('with role admin', async function () {
			const task = await db.models.Task.create(TaskFactory.create(testAdminUser.id, testEmployeeUser1.id))
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${task.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.property('id').eql(task.id)
			response.body.should.have.property('name').eql(task.name)
			response.body.should.have.property('employee').eql({
				userId: testEmployeeUser1.id,
				firstName: testEmployeeContact1.firstName,
				lastName: testEmployeeContact1.lastName,
				phone: testEmployeeContact1.phone,
				mobile: testEmployeeContact1.mobile,
			})
			response.body.should.have.property('creator').eql({
				userId: testAdminUser.id,
				firstName: testAdminContact.firstName,
				lastName: testAdminContact.lastName,
				phone: testAdminContact.phone,
				mobile: testAdminContact.mobile,
			})
			new Date(response.body.startingAt).getTime().should.eql(new Date(task.startingAt).getTime())
			new Date(response.body.endingAt).getTime().should.eql(new Date(task.endingAt).getTime())
			response.body.should.have.property('remark').eql(task.remark)
			response.body.should.have.property('status').eql(task.status)
			response.body.should.have.property('createdAt')
			response.body.should.have.property('updatedAt')
		})

		it('with role employee - own task', async function () {
			const task = await db.models.Task.create(TaskFactory.create(testAdminUser.id, testEmployeeUser1.id))
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${task.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser1.token}`)

			response.should.have.status(200)
		})

		it("with role employee - other employee's task", async function () {
			const task = await db.models.Task.create(TaskFactory.create(testAdminUser.id, testEmployeeUser1.id))
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${task.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser2.token}`)

			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('task_unauthorized'))
		})
	})
})
