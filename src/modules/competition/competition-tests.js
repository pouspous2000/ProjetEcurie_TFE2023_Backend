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
import { CompetitionFactory } from '@/modules/competition/factory'
import { ArrayUtils } from '@/utils/ArrayUtils'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/competitions'

describe('Competition module', function () {
	let roleAdmin, roleEmployee, roleClient
	let testAdminUser, testEmployeeUser1, testEmployeeUser2, testClientUser1, testClientUser2
	// eslint-disable-next-line no-unused-vars
	let testAdminContact, testEmployeeContact1, testEmployeeContact2, testClientContact1, testClientContact2

	beforeEach(async function () {
		await db.models.Competition.destroy({ truncate: { cascade: true } })
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
			const competitions = []
			for (let i = 0; i < 10; i++) {
				competitions.push(
					await db.models.Competition.create(
						CompetitionFactory.create(
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
			response.body.should.have.length(competitions.length)
		})

		it('with role employee', async function () {
			const competitions = []
			for (let i = 0; i < 10; i++) {
				competitions.push(
					await db.models.Competition.create(
						CompetitionFactory.create(
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
			response.body.should.have.length(competitions.length)
		})

		it('with role client', async function () {
			const competitions = []
			for (let i = 0; i < 10; i++) {
				competitions.push(
					await db.models.Competition.create(
						CompetitionFactory.create(
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
			response.body.should.have.length(competitions.length)
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
				const competition = await db.models.Competition.create(CompetitionFactory.create(testEmployeeUser1.id))
				await competition.setParticipants([testClientUser1.id])
				let response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						creatorId: competition.creatorId + 1,
						startingAt: competition.startingAt,
						endingAt: competition.endingAt,
						participants: [testClientUser1.id],
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)

				const startingAtDate = new Date(competition.startingAt)
				startingAtDate.setSeconds(startingAtDate.getSeconds() + 1)
				const formattingStartingDate = startingAtDate.toISOString()

				const endingAtDate = new Date(competition.endingAt)
				endingAtDate.setSeconds(startingAtDate.getSeconds() - 1)
				const formattingEndingDate = startingAtDate.toISOString()

				response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						creatorId: competition.creatorId,
						startingAt: formattingStartingDate,
						endingAt: competition.endingAt,
						participants: [testClientUser1.id],
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)

				response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						creatorId: competition.creatorId,
						startingAt: competition.startingAt,
						endingAt: formattingEndingDate,
						participants: [testClientUser1.id],
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)

				response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						creatorId: competition.creatorId,
						startingAt: competition.startingAt,
						endingAt: competition.endingAt,
						participants: [testClientUser1.id + 1],
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(0)

				response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.query({
						creatorId: competition.creatorId,
						startingAt: competition.startingAt,
						endingAt: competition.endingAt,
						participants: [testClientUser1.id],
					})
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.body.should.have.length(1)
			})
		})
	})

	describe('show', async function () {
		it('with role admin', async function () {
			const competition = await db.models.Competition.create(CompetitionFactory.create(testEmployeeUser1.id))
			await competition.setParticipants([testClientUser1.id])

			const response = await chai
				.request(app)
				.get(`${routePrefix}/${competition.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.property('id').eql(competition.id)
			response.body.should.have
				.property('name')
				.eql(StringUtils.capitalizeFirstLetter(competition.name.toLowerCase().trim()))
			response.body.should.have.property('description').eql(competition.description.trim())
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
			new Date(response.body.startingAt).getTime().should.eql(new Date(competition.startingAt).getTime())
			new Date(response.body.endingAt).getTime().should.eql(new Date(competition.endingAt).getTime())
			response.body.should.have.property('createdAt')
			response.body.should.have.property('updatedAt')
		})

		it('with role employee', async function () {
			const competition = await db.models.Competition.create(CompetitionFactory.create(testEmployeeUser1.id))
			await competition.setParticipants([testClientUser1.id])

			const response = await chai
				.request(app)
				.get(`${routePrefix}/${competition.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser2.token}`)

			response.should.have.status(200)
		})

		it('with role client', async function () {
			const competition = await db.models.Competition.create(CompetitionFactory.create(testEmployeeUser1.id))
			await competition.setParticipants([testClientUser1.id])

			const response = await chai
				.request(app)
				.get(`${routePrefix}/${competition.id}`)
				.set('Authorization', `Bearer ${testClientUser1.token}`)

			response.should.have.status(200)
		})

		it('with role admin - 404', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${1}`)
				.set('Authorization', `Bearer ${testClientUser1.token}`)
			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('competition_404'))
		})
	})

	describe('delete', async function () {
		it('with role admin', async function () {
			const competition = await db.models.Competition.create(CompetitionFactory.create(testEmployeeUser1.id))
			await competition.setParticipants([testClientUser1.id])
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${competition.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(204)
		})

		it('with role employee - own competition', async function () {
			const competition = await db.models.Competition.create(CompetitionFactory.create(testEmployeeUser1.id))
			await competition.setParticipants([testClientUser1.id])
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${competition.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser1.token}`)
			response.should.have.status(204)
		})

		it("with role employee - other employee's competition", async function () {
			const competition = await db.models.Competition.create(CompetitionFactory.create(testEmployeeUser1.id))
			await competition.setParticipants([testClientUser1.id])
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${competition.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser2.token}`)
			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('competition_unauthorized'))
		})

		it('with role client', async function () {
			const competition = await db.models.Competition.create(CompetitionFactory.create(testEmployeeUser1.id))
			await competition.setParticipants([testClientUser1.id])
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${competition.id}`)
				.set('Authorization', `Bearer ${testClientUser1.token}`)
			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('authentication_role_incorrectRolePermission'))
		})

		it('with role admin - 404', async function () {
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(404)
		})
	})

	describe('create', async function () {
		describe('with valid data', async function () {
			it('with role admin', async function () {
				const data = CompetitionFactory.create(testEmployeeUser1)
				delete data['creatorId']
				data.participants = [testClientUser1.id]

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
				response.body.should.have.property('description').eql(data.description.trim())
				response.body.should.have.property('creator').eql({
					userId: testAdminUser.id,
					firstName: testAdminContact.firstName,
					lastName: testAdminContact.lastName,
					phone: testAdminContact.phone,
					mobile: testAdminContact.mobile,
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
				new Date(response.body.startingAt).getTime().should.eql(new Date(data.startingAt).getTime())
				new Date(response.body.endingAt).getTime().should.eql(new Date(data.endingAt).getTime())
				response.body.should.have.property('createdAt')
				response.body.should.have.property('updatedAt')
			})

			it('with role employee', async function () {
				const data = CompetitionFactory.create(testEmployeeUser1.id)
				delete data['creatorId']
				data.participants = [testClientUser1.id]

				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testEmployeeUser1.token}`)
					.send(data)

				response.should.have.status(201)
			})

			it('with role client', async function () {
				const data = CompetitionFactory.create(testEmployeeUser1.id)
				delete data['creatorId']
				data.participants = [testClientUser1.id]

				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testClientUser1.token}`)
					.send(data)

				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})
		})

		describe('invalid data - middleware', async function () {
			it('with role admin but does not matter', async function () {
				const data = {}
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)
				response.should.have.status(422)
				response.body.errors
					.map(error => error.path)
					.should.eql(['name', 'description', 'participants', 'startingAt', 'endingAt'])
			})
		})

		describe('invalid data - sql', async function () {
			it('null values', async function () {
				try {
					await db.models.Competition.create({})
				} catch (error) {
					error.errors
						.map(err => err.path)
						.should.eql(['creatorId', 'name', 'description', 'startingAt', 'endingAt'])
				}
			})
		})
	})
})
