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
import { StringUtils } from '@/utils/StringUtils'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/tasks'

describe('Task module', function () {
	let roleAdmin, roleEmployee, roleClient
	let testAdminUser, testEmployeeUser1, testEmployeeUser2, testClientUser
	// eslint-disable-next-line no-unused-vars
	let testAdminContact, testEmployeeContact1, testEmployeeContact2, testClientContact

	beforeEach(async function () {
		await db.models.Task.destroy({ truncate: { cascade: true } })
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
			const task = await db.models.Task.create(TaskFactory.create(testAdminUser.id, testEmployeeUser1.id))
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${task.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(204)
		})

		it('with role employee', async function () {
			const task = await db.models.Task.create(TaskFactory.create(testAdminUser.id, testEmployeeUser1.id))
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${task.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser1.token}`)
			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('authentication_role_incorrectRolePermission'))
		})

		it('with role client', async function () {
			const task = await db.models.Task.create(TaskFactory.create(testAdminUser.id, testEmployeeUser1.id))
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${task.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('authentication_role_incorrectRolePermission'))
		})
	})

	describe('create', function () {
		describe('create with valid data', async function () {
			it('with role admin', async function () {
				const data = TaskFactory.create(testAdminUser.id, testEmployeeUser1.id)
				delete data['status']
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(201)
				response.body.should.have.property('id')
				response.body.should.have
					.property('name')
					.eql(StringUtils.capitalizeFirstLetter(data.name.toLowerCase().trim()))
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
				new Date(response.body.startingAt).getTime().should.eql(new Date(data.startingAt).getTime())
				new Date(response.body.endingAt).getTime().should.eql(new Date(data.endingAt).getTime())
				response.body.should.have.property('remark').eql(data.remark)
				response.body.should.have.property('status').eql('PENDING')
				response.body.should.have.property('createdAt')
				response.body.should.have.property('updatedAt')
			})

			it('with role employee', async function () {
				const data = TaskFactory.create(testAdminUser.id, testEmployeeUser1.id)
				delete data['status']
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testEmployeeUser1.token}`)
					.send(data)

				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})

			it('with role client', async function () {
				const data = TaskFactory.create(testAdminUser.id, testEmployeeUser1.id)
				delete data['status']
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

		describe('create invalid - middleware', async function () {
			it('with role admin', async function () {
				const data = {}
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.errors
					.map(error => error.path)
					.should.eql(['employeeId', 'name', 'description', 'startingAt', 'endingAt'])
			})
		})

		describe('create invalid - sql', async function () {
			it('with role admin', async function () {
				try {
					await db.models.Task.create({})
				} catch (error) {
					error.errors
						.map(err => err.path)
						.should.eql([
							'creatorId',
							'employeeId',
							'name',
							'description',
							'startingAt',
							'endingAt',
							'status',
						])
				}
			})
		})
	})

	describe('update', function () {
		describe('with role admin', async function () {
			it('status change not to cancelled - not allowed', async function () {
				const task = await db.models.Task.create(
					TaskFactory.create(testAdminUser.id, testEmployeeUser1.id, 'COMPLETED')
				)
				const data = TaskFactory.create(testAdminUser.id, testEmployeeUser1.id, 'IN PROGRESS')
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${task.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)
				response.should.have.status(401)
				response.body.should.have.property('message').eql(i18next.t('task_401_update_admin_status'))
			})

			it('any field change when status is in [CONFIRMED, IN PROGRESS, BLOCKED]', async function () {
				const data = TaskFactory.create(testAdminUser.id, testEmployeeUser1.id, 'CONFIRMED')
				const task = await db.models.Task.create(data)
				data.name = 'updatedName'

				const response = await chai
					.request(app)
					.put(`${routePrefix}/${task.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)
				response.should.have.status(401)
				response.body.should.have.property('message').eql(i18next.t('task_401_update_admin_field_when_status'))
			})

			it('allowed changes when status is pending', async function () {
				const data = TaskFactory.create(testAdminUser.id, testEmployeeUser1.id, 'PENDING')
				const task = await db.models.Task.create(data)
				data.name = 'updatedName'

				const response = await chai
					.request(app)
					.put(`${routePrefix}/${task.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				// we do not care about the response itself
				response.should.have.status(200)
				response.body.should.have
					.property('name')
					.eql(StringUtils.capitalizeFirstLetter(data.name.toLowerCase().trim()))
			})
		})

		describe('with role employee', async function () {
			describe('not allowed - on other employee task', async function () {
				it('', async function () {
					const data = TaskFactory.create(testAdminUser.id, testEmployeeUser1.id, 'COMPLETED')
					const task = await db.models.Task.create(data)
					const response = await chai
						.request(app)
						.put(`${routePrefix}/${task.id}`)
						.set('Authorization', `Bearer ${testEmployeeUser2.token}`)
						.send(data)

					response.should.have.status(401)
					response.body.should.have.property('message').eql(i18next.t('task_unauthorized'))
				})
			})
			describe('not allowed : status machine state', async function () {
				it('from PENDING to other than CONFIRMED', async function () {
					const data = TaskFactory.create(testAdminUser.id, testEmployeeUser1.id, 'PENDING')
					const task = await db.models.Task.create(data)
					data.name = StringUtils.capitalizeFirstLetter(data.name.toLowerCase().trim())
					data.status = 'CANCELLED'
					const response = await chai
						.request(app)
						.put(`${routePrefix}/${task.id}`)
						.set('Authorization', `Bearer ${testEmployeeUser1.token}`)
						.send(data)

					response.should.have.status(422)
					response.body.should.have
						.property('message')
						.eql(i18next.t('task_422_update_employee_fromPending_toConfirmed'))
				})

				it('from CONFIRMED to other than IN PROGRESS | BLOCKED', async function () {
					const data = TaskFactory.create(testAdminUser.id, testEmployeeUser1.id, 'CONFIRMED')
					const task = await db.models.Task.create(data)
					data.name = StringUtils.capitalizeFirstLetter(data.name.toLowerCase().trim())
					data.status = 'PENDING'
					const response = await chai
						.request(app)
						.put(`${routePrefix}/${task.id}`)
						.set('Authorization', `Bearer ${testEmployeeUser1.token}`)
						.send(data)

					response.should.have.status(422)
					response.body.should.have
						.property('message')
						.eql(i18next.t('task_422_update_employee_fromConfirmed_toInProgressOrBlocked'))
				})

				it('from IN PROGRESS to other than COMPLETED | BLOCKED', async function () {
					const data = TaskFactory.create(testAdminUser.id, testEmployeeUser1.id, 'IN PROGRESS')
					const task = await db.models.Task.create(data)
					data.name = StringUtils.capitalizeFirstLetter(data.name.toLowerCase().trim())
					data.status = 'PENDING'
					const response = await chai
						.request(app)
						.put(`${routePrefix}/${task.id}`)
						.set('Authorization', `Bearer ${testEmployeeUser1.token}`)
						.send(data)
					response.should.have.status(422)
					response.body.should.have
						.property('message')
						.eql(i18next.t('task_422_update_employee_fromInProgress_toCompletedOrBlocked'))
				})

				it('from BLOCKED to other than IN PROGRESS', async function () {
					const data = TaskFactory.create(testAdminUser.id, testEmployeeUser1.id, 'BLOCKED')
					const task = await db.models.Task.create(data)
					data.name = StringUtils.capitalizeFirstLetter(data.name.toLowerCase().trim())
					data.status = 'PENDING'
					const response = await chai
						.request(app)
						.put(`${routePrefix}/${task.id}`)
						.set('Authorization', `Bearer ${testEmployeeUser1.token}`)
						.send(data)
					response.should.have.status(422)
					response.body.should.have
						.property('message')
						.eql(i18next.t('task_422_update_employee_fromBlocked_toInProgress'))
				})
			})
			describe('not allowed - not allowed fields', async function () {
				it('name change but does not matter', async function () {
					const data = TaskFactory.create(testAdminUser.id, testEmployeeUser1.id, 'BLOCKED')
					const task = await db.models.Task.create(data)
					data.name = StringUtils.capitalizeFirstLetter(data.name.toLowerCase().trim()) + 'Updated'

					const response = await chai
						.request(app)
						.put(`${routePrefix}/${task.id}`)
						.set('Authorization', `Bearer ${testEmployeeUser1.token}`)
						.send(data)
					response.should.have.status(401)
					response.body.should.have
						.property('message')
						.eql(i18next.t('task_unauthorized_employee_updateField'))
				})
			})

			describe('allowed', async function () {
				it('status and task name', async function () {
					const data = TaskFactory.create(testAdminUser.id, testEmployeeUser1.id, 'PENDING')
					const task = await db.models.Task.create(data)
					data.status = 'CONFIRMED'
					data.remark = 'some allowed remark'
					data.name = StringUtils.capitalizeFirstLetter(data.name.toLowerCase().trim())

					const response = await chai
						.request(app)
						.put(`${routePrefix}/${task.id}`)
						.set('Authorization', `Bearer ${testEmployeeUser1.token}`)
						.send(data)

					response.should.have.status(200)
				})
			})
		})

		it('with role client', async function () {
			const task = await db.models.Task.create(TaskFactory.create(testAdminUser.id, testEmployeeUser1.id))
			const response = await chai
				.request(app)
				.put(`${routePrefix}/${task.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
				.send({})
			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('authentication_role_incorrectRolePermission'))
		})
	})
})
