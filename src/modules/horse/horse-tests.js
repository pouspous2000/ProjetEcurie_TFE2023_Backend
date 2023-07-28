import { describe, it, beforeEach, afterEach } from 'mocha'

import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'

import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { ArrayUtils } from '@/utils/ArrayUtils'
import { HorseFactory } from '@/modules/horse/factory'
import { PensionFactory } from '@/modules/pension/factory'
import { ContactFactory } from '@/modules/contact/factory'
import { RideFactory } from '@/modules/ride/factory'
import { AdditiveFactory } from '@/modules/additive/factory'
import { HorseContributorFactory } from '@/modules/horse-contributor/factory'
import { HorseContributorJobFactory } from '@/modules/horse-contributor-job/factory'

import i18next from '../../../i18n'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/horses'

describe('Horse module', function () {
	let testAdminUser, testEmployeeUser, testClientUser
	let testHorseOwner1, testHorseOwner2
	let testHorseOwner1Contact, testHorseOwner2Contact
	let pensions = []
	let rides = []
	let roleAdmin, roleEmployee, roleClient

	beforeEach(async function () {
		await db.models.HorseContributor.destroy({ truncate: { cascade: true } })
		await db.models.HorseContributorJob.destroy({ truncate: { cascade: true } })
		await db.models.Additive.destroy({ truncate: { cascade: true }, force: true })
		await db.models.Contact.destroy({ truncate: { cascade: true } })
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

		//create horse owners
		testHorseOwner1 = await db.models.User.create(UserFactory.create(roleClient.id, true))
		testHorseOwner2 = await db.models.User.create(UserFactory.create(roleClient.id, true))

		// create horse owner contacts
		testHorseOwner1Contact = await db.models.Contact.create(ContactFactory.create(testHorseOwner1.id))
		testHorseOwner2Contact = await db.models.Contact.create(ContactFactory.create(testHorseOwner2.id))

		// create pensions
		for (let i = 0; i < 5; i++) {
			pensions.push(await db.models.Pension.create(PensionFactory.create()))
		}

		// create rides
		const rideObjs = RideFactory.createAll()
		for (let i = 0; i < rideObjs.length; i++) {
			rides.push(await db.models.Ride.create(rideObjs[i]))
		}

		testAdminUser.token = testAdminUser.generateToken()
		testEmployeeUser.token = testEmployeeUser.generateToken()
		testClientUser.token = testClientUser.generateToken()
		testHorseOwner1.token = testHorseOwner1.generateToken()
		testHorseOwner2.token = testHorseOwner2.generateToken()
	})

	afterEach(function () {
		testAdminUser = testEmployeeUser = testClientUser = undefined
		roleAdmin = roleEmployee = roleClient = undefined
		testHorseOwner1 = testHorseOwner2 = undefined
		testHorseOwner1Contact = testHorseOwner2Contact = undefined
		pensions = []
		rides = []
	})

	describe('index', async function () {
		let horses
		beforeEach(async function () {
			horses = await db.models.Horse.bulkCreate([
				HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id),
				HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id),
				HorseFactory.create(testHorseOwner2.id, ArrayUtils.getRandomElement(pensions).id),
			])
		})
		afterEach(function () {
			horses = undefined
		})

		it('with role admin', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(horses.length)
		})

		it('with role employee', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(horses.length)
		})

		describe('with role client', async function () {
			it('client who is not owner - no result', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.set('Authorization', `Bearer ${testClientUser.token}`)
				response.should.have.status(200)
				response.body.should.have.length(0)
			})

			it('client who is owner of multiple horses', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.set('Authorization', `Bearer ${testHorseOwner1.token}`)
				response.should.have.status(200)
				response.body.should.have.length(horses.filter(horse => horse.ownerId === testHorseOwner1.id).length)
			})
		})
	})

	describe('show', async function () {
		it('with role admin', async function () {
			const pension = ArrayUtils.getRandomElement(pensions)
			const ride = ArrayUtils.getRandomElement(rides)
			const horse = await db.models.Horse.create(HorseFactory.create(testHorseOwner1.id, pension.id, ride.id))
			const horseContributor = await db.models.HorseContributor.create(HorseContributorFactory.create())
			const horseContributorJobs = await db.models.HorseContributorJob.bulkCreate(
				HorseContributorJobFactory.bulkCreate(3)
			)
			const horseContributorHorseContributorJobObjs = horseContributorJobs.map(hcj => ({
				horseId: horse.id,
				horseContributorId: horseContributor.id,
				horseContributorJobId: hcj.id,
			}))
			await db.models.HorseContributorHorseContributorJob.bulkCreate(horseContributorHorseContributorJobObjs)
			const horsemen = [testHorseOwner1, testHorseOwner2]
			horse.setHorsemen(horsemen.map(horseman => horseman.id))

			const additives = await db.models.Additive.bulkCreate([AdditiveFactory.create(), AdditiveFactory.create()])

			const additivesDatas = await db.models.AdditiveData.bulkCreate(
				additives.map(additive => ({
					additiveId: additive.id,
					horseId: horse.id,
					name: additive.name,
					price: additive.price,
					status: 'ACTIVE',
				}))
			)

			const response = await chai
				.request(app)
				.get(`${routePrefix}/${horse.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.property('id').eql(horse.id)
			response.body.should.have.property('name').eql(horse.name)
			response.body.should.have.property('comment').eql(horse.comment)
			response.body.should.have.property('createdAt').not.eql(null)
			response.body.should.have.property('updatedAt').not.eql(null)
			response.body.should.have.property('owner').eql({
				email: testHorseOwner1.email,
				userId: testHorseOwner1.id,
				firstName: testHorseOwner1Contact.firstName,
				lastName: testHorseOwner1Contact.lastName,
				phone: testHorseOwner1Contact.phone,
				mobile: testHorseOwner1Contact.mobile,
				address: testHorseOwner1Contact.address,
				invoicingAddress: testHorseOwner1Contact.invoicingAddress,
			})
			response.body.should.have.property('pension').eql({
				id: pension.id,
				name: pension.name,
				monthlyPrice: pension.monthlyPrice,
				description: pension.description,
			})
			response.body.should.have.property('ride').eql({
				id: ride.id,
				name: ride.name,
				period: ride.period,
				price: ride.price,
			})
			response.body.horsemen.should.have.length(2)
			response.body.horsemen.should.deep.include({
				email: testHorseOwner1.email,
				userId: testHorseOwner1.id,
				firstName: testHorseOwner1Contact.firstName,
				lastName: testHorseOwner1Contact.lastName,
				phone: testHorseOwner1Contact.phone,
				mobile: testHorseOwner1Contact.mobile,
				address: testHorseOwner1Contact.address,
				invoicingAddress: testHorseOwner1Contact.invoicingAddress,
			})
			response.body.additiveDatas.should.have.length(2)
			response.body.additiveDatas.should.deep.include({
				id: additivesDatas[0].id,
				additiveId: additivesDatas[0].additiveId,
				name: additivesDatas[0].name,
				price: additivesDatas[0].price,
				status: additivesDatas[0].status,
			})
			response.body.horseContributorHorseContributorJobs.should.have.length(
				horseContributorHorseContributorJobObjs.length
			)

			response.body.horseContributorHorseContributorJobs[0].should.have.property('horseContributor').eql({
				id: horseContributor.id,
				firstName: horseContributor.firstName,
				lastName: horseContributor.lastName,
				email: horseContributor.email,
			})
			response.body.horseContributorHorseContributorJobs[0].should.have.property('horseContributorJob').eql({
				id: horseContributorJobs[0].id,
				name: horseContributorJobs[0].name,
			})
		})

		it('with role employee', async function () {
			const horse = await db.models.Horse.create(
				HorseFactory.create(
					testHorseOwner1.id,
					ArrayUtils.getRandomElement(pensions).id,
					ArrayUtils.getRandomElement(rides).id
				)
			)
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${horse.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
		})

		describe('with role client', async function () {
			it('no owner', async function () {
				const horse = await db.models.Horse.create(
					HorseFactory.create(
						testHorseOwner1.id,
						ArrayUtils.getRandomElement(pensions).id,
						ArrayUtils.getRandomElement(rides).id
					)
				)
				const response = await chai
					.request(app)
					.get(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testClientUser.token}`)
				response.should.have.status(401)
				response.body.should.have.property('message').eql(i18next.t('horse_401'))
			})

			it('owner', async function () {
				const horse = await db.models.Horse.create(
					HorseFactory.create(
						testHorseOwner1.id,
						ArrayUtils.getRandomElement(pensions).id,
						ArrayUtils.getRandomElement(rides).id
					)
				)
				const response = await chai
					.request(app)
					.get(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testHorseOwner1.token}`)
				response.should.have.status(200)
			})
		})

		it('404', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(404)
		})
	})

	describe('delete', async function () {
		describe('permissions', async function () {
			let horse

			beforeEach(async function () {
				horse = await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
				)
			})

			afterEach(function () {
				horse = undefined
			})

			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.should.have.status(204)
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
				response.should.have.status(204)
			})

			describe('with role client', async function () {
				it('not owner - not allowed', async function () {
					// testHorseOwner1
					const response = await chai
						.request(app)
						.delete(`${routePrefix}/${horse.id}`)
						.set('Authorization', `Bearer ${testClientUser.token}`)
					response.should.have.status(401)
					response.body.should.have.property('message').eql(i18next.t('horse_401'))
				})

				it('owner - allowed', async function () {
					const response = await chai
						.request(app)
						.delete(`${routePrefix}/${horse.id}`)
						.set('Authorization', `Bearer ${testHorseOwner1.token}`)
					response.should.have.status(204)
				})
			})
		})

		describe('cascade delete', async function () {
			it('horse is deleted when owner is deleted', async function () {
				const horse = await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
				)
				await testHorseOwner1.destroy()
				const response = await chai
					.request(app)
					.get(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.should.have.status(404)
			})

			it('horse is not deleted when pension is soft deleted', async function () {
				const horse = await db.models.Horse.create(HorseFactory.create(testHorseOwner1.id, pensions[0].id))
				await pensions[0].destroy()

				const response = await chai
					.request(app)
					.get(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(200)
			})

			it('horse is not deleted when ride is soft deleted', async function () {
				const horse = await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, pensions[0].id, rides[0].id)
				)
				await rides[0].destroy()

				const response = await chai
					.request(app)
					.get(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(200)
			})
		})

		it('404', async function () {
			const horse = await db.models.Horse.create(
				HorseFactory.create(testHorseOwner1.id, pensions[0].id, rides[0].id)
			)

			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${horse.id + 1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('horse_404'))
		})
	})

	describe('create', async function () {
		describe('permissions', async function () {
			let horseData

			beforeEach(async function () {
				horseData = {
					...HorseFactory.create(testHorseOwner1.id, pensions[0].id, rides[0].id),
					horsemen: [testHorseOwner1.id],
				}
			})

			afterEach(function () {
				horseData = undefined
			})

			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(horseData)

				response.should.have.status(201)

				response.body.should.have.property('id')
				response.body.should.have.property('name').eql(horseData.name)
				response.body.should.have.property('comment').eql(horseData.comment)
				response.body.should.have.property('createdAt').not.eql(null)
				response.body.should.have.property('updatedAt').not.eql(null)
				response.body.should.have.property('owner').eql({
					email: testHorseOwner1.email,
					userId: testHorseOwner1.id,
					firstName: testHorseOwner1Contact.firstName,
					lastName: testHorseOwner1Contact.lastName,
					phone: testHorseOwner1Contact.phone,
					mobile: testHorseOwner1Contact.mobile,
					address: testHorseOwner1Contact.address,
					invoicingAddress: testHorseOwner1Contact.invoicingAddress,
				})
				response.body.should.have.property('pension').eql({
					id: pensions[0].id,
					name: pensions[0].name,
					monthlyPrice: pensions[0].monthlyPrice,
					description: pensions[0].description,
				})
				response.body.should.have.property('ride').eql({
					id: rides[0].id,
					name: rides[0].name,
					period: rides[0].period,
					price: rides[0].price,
				})
				response.body.should.have.property('horsemen').eql([
					{
						email: testHorseOwner1.email,
						userId: testHorseOwner1.id,
						firstName: testHorseOwner1Contact.firstName,
						lastName: testHorseOwner1Contact.lastName,
						phone: testHorseOwner1Contact.phone,
						mobile: testHorseOwner1Contact.mobile,
						address: testHorseOwner1Contact.address,
						invoicingAddress: testHorseOwner1Contact.invoicingAddress,
					},
				])
				response.body.should.have.property('additiveDatas').eql([])
				response.body.should.have.property('horseContributorHorseContributorJobs').eql([])
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(horseData)

				response.should.have.status(201)
			})

			describe('with role client', async function () {
				it('not owner - not allowed', async function () {
					const response = await chai
						.request(app)
						.post(`${routePrefix}`)
						.set('Authorization', `Bearer ${testClientUser.token}`)
						.send(horseData)
					response.should.have.status(401)
					response.body.should.have.property('message').eql(i18next.t('horse_401'))
				})

				it('owner - allowed', async function () {
					const response = await chai
						.request(app)
						.post(`${routePrefix}`)
						.set('Authorization', `Bearer ${testHorseOwner1.token}`)
						.send(horseData)
					response.should.have.status(201)
				})
			})
		})

		describe('middleware', async function () {
			it('null values', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})
				response.should.have.status(422)
				response.body.errors
					.map(error => error.path)
					.should.eql(['comment', 'ownerId', 'pensionId', 'name', 'horsemen'])
			})
		})

		describe('sql', async function () {
			it('not null values', async function () {
				try {
					await db.models.Horse.create({})
				} catch (error) {
					error.errors.map(err => err.path).should.eql(['ownerId', 'name'])
				}
			})
		})

		describe('service', async function () {
			let horseData

			beforeEach(async function () {
				horseData = {
					...HorseFactory.create(testHorseOwner1.id, pensions[0].id, rides[0].id),
					horsemen: [testHorseOwner1.id],
				}
			})

			afterEach(function () {
				horseData = undefined
			})

			it('inexisting owner', async function () {
				const lastUser = await db.models.User.findOne({
					order: [['id', 'DESC']],
				})
				horseData.ownerId = lastUser.id + 1

				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(horseData)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('horse_422_inexistingOwner'))
			})

			it('inexisting pension', async function () {
				const lastPension = await db.models.Pension.findOne({
					order: [['id', 'DESC']],
				})
				horseData.pensionId = lastPension.id + 1
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(horseData)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('horse_422_inexistingPension'))
			})

			it('inexisting ride', async function () {
				const lastRide = await db.models.Ride.findOne({
					order: [['id', 'DESC']],
				})
				horseData.rideId = lastRide.id + 1

				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(horseData)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('horse_422_inexistingRide'))
			})

			it('inexisting horsemen', async function () {
				const lastUser = await db.models.User.findOne({
					order: [['id', 'DESC']],
				})
				horseData.horsemen = [lastUser.id + 1]

				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(horseData)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('horse_422_inexistingHorseman'))
			})
		})
	})

	describe('update', async function () {
		describe('permissions', async function () {
			let horse
			let data

			beforeEach(async function () {
				horse = await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, pensions[0].id, rides[0].id)
				)
				await db.models.PensionData.create({
					horseId: horse.id,
					pensionId: pensions[0].id,
					name: pensions[0].name,
					monthlyPrice: pensions[0].monthlyPrice,
					description: pensions[0].description,
					deletedAt: null,
				})
				await db.models.RideData.create({
					horseId: horse.id,
					rideId: rides[0].id,
					name: rides[0].name,
					period: rides[0].period,
					price: rides[0].price,
					deletedAt: null,
				})
				data = {
					ownerId: horse.ownerId,
					pensionId: pensions[1].id,
					rideId: rides[1].id,
					name: 'Updatedname',
					comment: 'Updatedcomment',
					horsemen: [testHorseOwner2.id],
				}
			})

			afterEach(function () {
				horse = undefined
				data = undefined
			})

			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(200)
				response.body.should.have.property('id').eql(horse.id)
				response.body.should.have.property('name').eql(data.name)
				response.body.should.have.property('comment').eql(data.comment)
				response.body.should.have.property('createdAt').not.eql(null)
				response.body.should.have.property('updatedAt').not.eql(null)
				response.body.should.have.property('owner').eql({
					email: testHorseOwner1.email,
					userId: testHorseOwner1.id,
					firstName: testHorseOwner1Contact.firstName,
					lastName: testHorseOwner1Contact.lastName,
					phone: testHorseOwner1Contact.phone,
					mobile: testHorseOwner1Contact.mobile,
					address: testHorseOwner1Contact.address,
					invoicingAddress: testHorseOwner1Contact.invoicingAddress,
				})
				response.body.should.have.property('pension').eql({
					id: pensions[1].id,
					name: pensions[1].name,
					monthlyPrice: pensions[1].monthlyPrice,
					description: pensions[1].description,
				})
				response.body.should.have.property('ride').eql({
					id: rides[1].id,
					name: rides[1].name,
					period: rides[1].period,
					price: rides[1].price,
				})
				response.body.should.have.property('horsemen').eql([
					{
						email: testHorseOwner2.email,
						userId: testHorseOwner2.id,
						firstName: testHorseOwner2Contact.firstName,
						lastName: testHorseOwner2Contact.lastName,
						phone: testHorseOwner2Contact.phone,
						mobile: testHorseOwner2Contact.mobile,
						address: testHorseOwner2Contact.address,
						invoicingAddress: testHorseOwner2Contact.invoicingAddress,
					},
				])
				response.body.should.have.property('additiveDatas').eql([])
				response.body.should.have.property('horseContributorHorseContributorJobs').eql([])
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(data)

				response.should.have.status(200)
			})

			describe('with role client', async function () {
				it('not owner - not allowed', async function () {
					const response = await chai
						.request(app)
						.put(`${routePrefix}/${horse.id}`)
						.set('Authorization', `Bearer ${testHorseOwner2.token}`)
						.send(data)
					response.should.have.status(401)
					response.body.should.have.property('message').eql(i18next.t('horse_401'))
				})

				it('owner - allowed', async function () {
					const response = await chai
						.request(app)
						.put(`${routePrefix}/${horse.id}`)
						.set('Authorization', `Bearer ${testHorseOwner1.token}`)
						.send(data)
					response.should.have.status(200)
				})
			})
		})

		describe('middleware', async function () {
			it('null values', async function () {
				const horse = await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, pensions[0].id, rides[0].id)
				)

				const response = await chai
					.request(app)
					.put(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})
				response.should.have.status(422)
				response.body.errors
					.map(error => error.path)
					.should.eql(['comment', 'ownerId', 'pensionId', 'name', 'horsemen'])
			})
		})

		describe('service', async function () {
			let horse, data

			beforeEach(async function () {
				horse = await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, pensions[0].id, rides[0].id)
				)
				await db.models.PensionData.create({
					horseId: horse.id,
					pensionId: pensions[0].id,
					name: pensions[0].name,
					monthlyPrice: pensions[0].monthlyPrice,
					description: pensions[0].description,
					deletedAt: null,
				})
				await db.models.RideData.create({
					horseId: horse.id,
					rideId: rides[0].id,
					name: rides[0].name,
					period: rides[0].period,
					price: rides[0].price,
					deletedAt: null,
				})
				data = {
					ownerId: horse.ownerId,
					pensionId: pensions[1].id,
					rideId: rides[1].id,
					name: 'Updatedname',
					comment: 'Updatedcomment',
					horsemen: [testHorseOwner2.id],
				}
			})

			afterEach(function () {
				horse = data = undefined
			})

			it('inexisting owner', async function () {
				const lastUser = await db.models.User.findOne({
					order: [['id', 'DESC']],
				})
				data.ownerId = lastUser.id + 1

				const response = await chai
					.request(app)
					.put(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('horse_422_inexistingOwner'))
			})

			it('inexisting pension', async function () {
				const lastPension = await db.models.Pension.findOne({
					order: [['id', 'DESC']],
				})
				data.pensionId = lastPension.id + 1

				const response = await chai
					.request(app)
					.put(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('horse_422_inexistingPension'))
			})

			it('inexisting ride', async function () {
				const lastRide = await db.models.Ride.findOne({
					order: [['id', 'DESC']],
				})
				data.rideId = lastRide.id + 1

				const response = await chai
					.request(app)
					.put(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('horse_422_inexistingRide'))
			})

			it('inexisting horsemen', async function () {
				const lastUser = await db.models.User.findOne({
					order: [['id', 'DESC']],
				})
				data.horsemen = [lastUser.id + 1]

				const response = await chai
					.request(app)
					.put(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('horse_422_inexistingHorseman'))
			})
		})
	})
})
