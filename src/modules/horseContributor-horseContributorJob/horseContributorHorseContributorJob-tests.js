import { describe, it, beforeEach, afterEach } from 'mocha'

import chaiHttp from 'chai-http'
import chai from 'chai'

import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { HorseFactory } from '@/modules/horse/factory'
import { RideFactory } from '@/modules/ride/factory'
import { PensionFactory } from '@/modules/pension/factory'

import app from '@/app'
import db from '@/database'

import i18next from '../../../i18n'
import { HorseContributorFactory } from '@/modules/horse-contributor/factory'
import { HorseContributorJobFactory } from '@/modules/horse-contributor-job/factory'
import { ContactFactory } from '@/modules/contact/factory'

chai.should()
chai.use(chaiHttp)

describe('HorseContributorHorseContributorJob module', async function () {
	let testAdminUser, testEmployeeUser, testClientUser
	let testHorseOwner1, testHorseOwner2
	// eslint-disable-next-line no-unused-vars
	let testHorseOwner1Contact
	let pensions = []
	let rides = []
	let horseContributors = []
	let horseContributorJobs = []
	let roleAdmin, roleEmployee, roleClient
	let horse

	beforeEach(async function () {
		await db.models.HorseContributor.destroy({ truncate: { cascade: true } })
		await db.models.HorseContributorJob.destroy({ truncate: { cascade: true } })
		await db.models.Horse.destroy({ truncate: { cascade: true } })
		await db.models.Pension.destroy({ truncate: { cascade: true }, force: true })
		await db.models.Ride.destroy({ truncate: { cascade: true }, force: true })
		await db.models.User.destroy({ truncate: { cascade: true } })
		await db.models.Role.destroy({ truncate: { cascade: true } })

		//create roles
		roleAdmin = await db.models.Role.create(RoleFactory.createAdmin())
		roleEmployee = await db.models.Role.create(RoleFactory.createEmployee())
		roleClient = await db.models.Role.create(RoleFactory.createClient())

		//create users
		testAdminUser = await db.models.User.create(UserFactory.createTestAdmin(roleAdmin.id))
		testEmployeeUser = await db.models.User.create(UserFactory.createTestEmployee(roleEmployee.id))
		testClientUser = await db.models.User.create(UserFactory.createTestClient(roleClient.id))

		//create horse owners users
		testHorseOwner1 = await db.models.User.create(UserFactory.create(roleClient.id, true))
		testHorseOwner2 = await db.models.User.create(UserFactory.create(roleClient.id, true))

		//create horse owner contact
		testHorseOwner1Contact = await db.models.Contact.create(ContactFactory.create(testHorseOwner1.id))

		// create pensions
		for (let i = 0; i < 5; i++) {
			pensions.push(await db.models.Pension.create(PensionFactory.create()))
		}

		// create rides
		const rideObjs = RideFactory.createAll()
		for (let i = 0; i < rideObjs.length; i++) {
			rides.push(await db.models.Ride.create(rideObjs[i]))
		}

		// tokens
		testAdminUser.token = testAdminUser.generateToken()
		testEmployeeUser.token = testEmployeeUser.generateToken()
		testClientUser.token = testClientUser.generateToken()
		testHorseOwner1.token = testHorseOwner1.generateToken()
		testHorseOwner2.token = testHorseOwner2.generateToken()

		//horse
		horse = await db.models.Horse.create(HorseFactory.create(testHorseOwner1.id, pensions[0].id, rides[0].id))

		//horseContributors
		horseContributors = await db.models.HorseContributor.bulkCreate(HorseContributorFactory.bulkCreate(5))

		//horseContributorJobs
		horseContributorJobs = await db.models.HorseContributorJob.bulkCreate(HorseContributorJobFactory.bulkCreate(6))
	})

	afterEach(function () {
		testAdminUser = testEmployeeUser = testClientUser = undefined
		testHorseOwner1 = testHorseOwner2 = undefined
		roleAdmin = roleEmployee = roleClient = undefined
		horse = undefined
		testHorseOwner1Contact = undefined
		pensions = []
		rides = []
		horseContributors = []
		horseContributorJobs = []
	})

	describe('addJobs', async function () {
		describe('permissions', async function () {
			let data
			beforeEach(function () {
				data = {
					horseContributorId: horseContributors[0].id,
					horseContributorJobIds: horseContributorJobs.map(hcj => hcj.id),
				}
			})

			afterEach(function () {
				data = undefined
			})

			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/addJobs`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(200)
				const should = chai.should()
				response.body.horseContributorHorseContributorJobs.should.have.length(
					data.horseContributorJobIds.length
				)
				for (let i = 0; i < data.horseContributorJobIds.length; i++) {
					should.equal(
						response.body.horseContributorHorseContributorJobs[i].horseContributor.id,
						horseContributors[0].id
					)
					should.equal(
						response.body.horseContributorHorseContributorJobs[i].horseContributor.firstName,
						horseContributors[0].firstName
					)
					should.equal(
						response.body.horseContributorHorseContributorJobs[i].horseContributor.lastName,
						horseContributors[0].lastName
					)
					should.equal(
						response.body.horseContributorHorseContributorJobs[i].horseContributor.email,
						horseContributors[0].email
					)
					should.equal(
						response.body.horseContributorHorseContributorJobs[i].horseContributorJob.id,
						horseContributorJobs[i].id
					)
					should.equal(
						response.body.horseContributorHorseContributorJobs[i].horseContributorJob.name,
						horseContributorJobs[i].name
					)
				}
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/addJobs`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(data)

				response.should.have.status(200)
			})

			describe('with role client', async function () {
				it("other client's horse - not allowed", async function () {
					const response = await chai
						.request(app)
						.post(`/horses/${horse.id}/addJobs`)
						.set('Authorization', `Bearer ${testHorseOwner2.token}`)
						.send(data)

					response.should.have.status(401)
					response.body.should.have
						.property('message')
						.eql(i18next.t('horseContributorHorseContributorJob_401'))
				})

				it('own horse - allowed', async function () {
					const response = await chai
						.request(app)
						.post(`/horses/${horse.id}/addJobs`)
						.set('Authorization', `Bearer ${testHorseOwner1.token}`)
						.send(data)

					response.should.have.status(200)
				})
			})
		})

		describe('middleware', async function () {
			it('missing mandatory values', async function () {
				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/addJobs`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})

				response.should.have.status(422)
				response.body.errors
					.map(error => error.path)
					.should.eql(['horseContributorId', 'horseContributorJobIds'])
			})
		})

		describe('service', async function () {
			let data
			beforeEach(function () {
				data = {
					horseContributorId: horseContributors[0].id,
					horseContributorJobIds: horseContributorJobs.map(hcj => hcj.id),
				}
			})

			afterEach(function () {
				data = undefined
			})

			it('inexisting horse', async function () {
				const response = await chai
					.request(app)
					.post(`/horses/${horse.id + 1}/addJobs`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.should.have
					.property('message')
					.eql(i18next.t('horseContributorHorseContributorJob_422_inexistingHorse'))
			})

			it('inexisting horseContributor', async function () {
				const lastHorseContributor = await db.models.HorseContributor.findOne({
					order: [['id', 'DESC']],
				})
				data.horseContributorId = lastHorseContributor.id + 1

				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/addJobs`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.should.have
					.property('message')
					.eql(i18next.t('horseContributorHorseContributorJob_422_inexistingHorseContributor'))
			})

			it('inexisting horseContributorJob', async function () {
				const lastHorseContributorJob = await db.models.HorseContributorJob.findOne({
					order: [['id', 'DESC']],
				})
				data.horseContributorJobIds = [...data.horseContributorJobIds, lastHorseContributorJob.id + 1]

				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/addJobs`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.should.have
					.property('message')
					.eql(i18next.t('horseContributorHorseContributorJob_422_inexistingHorseContributorJob'))
			})
		})
	})

	describe('removeJobs', async function () {
		describe('permissions', async function () {
			let horseContributorHorseContributorJobs

			beforeEach(async function () {
				const datas = []
				for (let i = 0; i < 2; i++) {
					datas.push({
						horseId: horse.id,
						horseContributorId: horseContributors[0].id,
						horseContributorJobId: horseContributorJobs[i].id,
					})
				}
				horseContributorHorseContributorJobs = await db.models.HorseContributorHorseContributorJob.bulkCreate(
					datas
				)
			})

			afterEach(function () {
				horseContributorJobs = undefined
			})

			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/removeJobs`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({
						horseContributorHorseContributorJobIds: horseContributorHorseContributorJobs.map(
							element => element.id
						),
					})

				response.should.have.status(200)
				response.body.should.have.property('horseContributorHorseContributorJobs').eql([])
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/removeJobs`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send({
						horseContributorHorseContributorJobIds: horseContributorHorseContributorJobs.map(
							element => element.id
						),
					})

				response.should.have.status(200)
			})

			describe('with role client', async function () {
				it("other client's horse - not allowed", async function () {
					const response = await chai
						.request(app)
						.post(`/horses/${horse.id}/removeJobs`)
						.set('Authorization', `Bearer ${testHorseOwner2.token}`)
						.send({
							horseContributorHorseContributorJobIds: horseContributorHorseContributorJobs.map(
								element => element.id
							),
						})

					response.should.have.status(401)
					response.body.should.have
						.property('message')
						.eql(i18next.t('horseContributorHorseContributorJob_401'))
				})

				it('own horse - allowed', async function () {
					const response = await chai
						.request(app)
						.post(`/horses/${horse.id}/removeJobs`)
						.set('Authorization', `Bearer ${testHorseOwner1.token}`)
						.send({
							horseContributorHorseContributorJobIds: horseContributorHorseContributorJobs.map(
								element => element.id
							),
						})

					response.should.have.status(200)
				})
			})
		})

		describe('middleware', async function () {
			it('missing mandatory values', async function () {
				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/removeJobs`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})
				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['horseContributorHorseContributorJobIds'])
			})
		})

		describe('service', async function () {
			let data

			beforeEach(async function () {
				const datas = []
				for (let i = 0; i < 2; i++) {
					datas.push({
						horseId: horse.id,
						horseContributorId: horseContributors[0].id,
						horseContributorJobId: horseContributorJobs[i].id,
					})
				}
				const elements = await db.models.HorseContributorHorseContributorJob.bulkCreate(datas)
				data = elements.map(element => element.id)
			})

			afterEach(function () {
				data = undefined
			})

			it('inexisting horse', async function () {
				const response = await chai
					.request(app)
					.post(`/horses/${horse.id + 1}/removeJobs`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({ horseContributorHorseContributorJobIds: data })
				response.should.have.status(422)
				response.body.should.have
					.property('message')
					.eql(i18next.t('horseContributorHorseContributorJob_422_inexistingHorse'))
			})

			it('inexisting horseContributorHorseContributorJob', async function () {
				const lastHorseContributorHorseContributorJob =
					await db.models.HorseContributorHorseContributorJob.findOne({
						order: [['id', 'DESC']],
					})
				data = [...data, lastHorseContributorHorseContributorJob.id + 1]

				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/removeJobs`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({ horseContributorHorseContributorJobIds: data })
				response.should.have.status(422)
				response.body.should.have
					.property('message')
					.eql(i18next.t('horseContributorHorseContributorJob_422_404'))
			})
		})
	})
})
