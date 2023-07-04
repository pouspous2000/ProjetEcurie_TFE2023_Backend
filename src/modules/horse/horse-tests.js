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
import i18next from '../../../i18n'
import { ContactFactory } from '@/modules/contact/factory'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/horses'

describe('Horse module', function () {
	let testAdminUser, testEmployeeUser, testClientUser
	let testHorseOwner1, testHorseOwner2
	let testHorseOwner1Contact, testHorseOwner2Contact
	let pensions = []
	let roleAdmin, roleEmployee, roleClient

	beforeEach(async function () {
		await db.models.PensionData.destroy({ truncate: { cascade: true } })
		await db.models.Contact.destroy({ truncate: { cascade: true } })
		await db.models.Horse.destroy({ truncate: { cascade: true } })
		await db.models.Pension.destroy({ truncate: { cascade: true }, force: true })
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
	})

	describe('index', async function () {
		it('index with role admin', async function () {
			const horses = [
				await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
				),
				await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
				),
				await db.models.Horse.create(
					HorseFactory.create(testHorseOwner2.id, ArrayUtils.getRandomElement(pensions).id)
				),
			]
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.length(horses.length)
		})

		it('index with role employee', async function () {
			const horses = [
				await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
				),
				await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
				),
				await db.models.Horse.create(
					HorseFactory.create(testHorseOwner2.id, ArrayUtils.getRandomElement(pensions).id)
				),
			]
			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(horses.length)
		})

		it('index with role client who is no owner', async function () {
			await db.models.Horse.create(
				HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
			)
			await db.models.Horse.create(
				HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
			)
			await db.models.Horse.create(
				HorseFactory.create(testHorseOwner2.id, ArrayUtils.getRandomElement(pensions).id)
			)

			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(200)
			response.body.should.have.length(0)
		})

		it('index with role client who is owner of multiple horses', async function () {
			await db.models.Horse.create(
				HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
			)
			await db.models.Horse.create(
				HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
			)
			await db.models.Horse.create(
				HorseFactory.create(testHorseOwner2.id, ArrayUtils.getRandomElement(pensions).id)
			)

			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testHorseOwner1.token}`)
			response.should.have.status(200)
			response.body.should.have.length(2)
		})
	})

	describe('show', async function () {
		it('with role admin', async function () {
			const pension = ArrayUtils.getRandomElement(pensions)
			const horse = await db.models.Horse.create(HorseFactory.create(testHorseOwner1.id, pension.id))
			horse.setHorsemen([testHorseOwner1.id, testHorseOwner2.id])
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${horse.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(200)
			response.body.should.have.property('id').eql(horse.id)
			response.body.should.have.property('name').eql(horse.name)
			response.body.should.have.property('comment').eql(horse.comment)
			response.body.should.have.property('createdAt')
			response.body.should.have.property('updatedAt')
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
				name: pension.name,
				monthlyPrice: pension.monthlyPrice,
				description: pension.description,
			})
			response.body.horsemen.should.have.length(2)
			response.body.horsemen[0].should.eql({
				email: testHorseOwner1.email,
				userId: testHorseOwner1.id,
				firstName: testHorseOwner1Contact.firstName,
				lastName: testHorseOwner1Contact.lastName,
				phone: testHorseOwner1Contact.phone,
				mobile: testHorseOwner1Contact.mobile,
				address: testHorseOwner1Contact.address,
				invoicingAddress: testHorseOwner1Contact.invoicingAddress,
			})
		})

		it('with role employee', async function () {
			const horse = await db.models.Horse.create(
				HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
			)
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${horse.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
			response.should.have.status(200)
		})

		it('with role client - no owner', async function () {
			const horse = await db.models.Horse.create(
				HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
			)
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${horse.id}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('horse_unauthorized'))
		})

		it('with role client - owner', async function () {
			const horse = await db.models.Horse.create(
				HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
			)
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${horse.id}`)
				.set('Authorization', `Bearer ${testHorseOwner1.token}`)
			response.should.have.status(200)
		})

		it('with role client - 404', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${1}`)
				.set('Authorization', `Bearer ${testClientUser.token}`)
			response.should.have.status(404)
		})
	})

	describe('delete', async function () {
		describe('classic delete', async function () {
			it('with role admin', async function () {
				const horse = await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
				)
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.should.have.status(204)
			})

			it('with role employee', async function () {
				const horse = await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
				)
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
				response.should.have.status(204)
			})

			it('with role client - owner', async function () {
				const horse = await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
				)
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testHorseOwner1.token}`)
				response.should.have.status(204)
			})

			it('with role client - not owner', async function () {
				const horse = await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id)
				)
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testHorseOwner2.token}`)
				response.should.have.status(401)
				response.body.should.have.property('message').eql(i18next.t('horse_unauthorized'))
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

			it('horse is not deleted when pension is (soft) deleted', async function () {
				const horse = await db.models.Horse.create(HorseFactory.create(testHorseOwner1.id, pensions[0].id))
				await pensions[0].destroy()

				const response = await chai
					.request(app)
					.get(`${routePrefix}/${horse.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(200)
			})
		})
	})
	describe('create', async function () {
		describe('create with valid data', async function () {
			it('with role admin', async function () {
				const horseData = HorseFactory.create(testHorseOwner1.id, pensions[0].id)
				horseData.horsemen = [testHorseOwner1.id]
				horseData.additives = []
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(horseData)

				response.should.have.status(201)
				response.body.should.have.property('id')
				response.body.should.have.property('name').eql(horseData.name)
				response.body.should.have.property('comment').eql(horseData.comment)
				response.body.should.have.property('createdAt')
				response.body.should.have.property('updatedAt')
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
					name: pensions[0].name,
					monthlyPrice: pensions[0].monthlyPrice,
					description: pensions[0].description,
				})
				response.body.horsemen[0].should.eql({
					email: testHorseOwner1.email,
					userId: testHorseOwner1.id,
					firstName: testHorseOwner1Contact.firstName,
					lastName: testHorseOwner1Contact.lastName,
					phone: testHorseOwner1Contact.phone,
					mobile: testHorseOwner1Contact.mobile,
					address: testHorseOwner1Contact.address,
					invoicingAddress: testHorseOwner1Contact.invoicingAddress,
				})
			})

			it('with role employee', async function () {
				const horseData = HorseFactory.create(testHorseOwner1.id, pensions[0].id)
				horseData.horsemen = [testHorseOwner1.id]
				horseData.additives = []
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(horseData)
				response.should.have.status(201)
			})

			it('with role employee - not owner', async function () {
				const horseData = HorseFactory.create(testHorseOwner1.id, pensions[0].id)
				horseData.horsemen = [testHorseOwner1.id]
				horseData.additives = []
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testHorseOwner2.token}`)
					.send(horseData)
				response.should.have.status(401)
			})

			it('with role employee - owner', async function () {
				const horseData = HorseFactory.create(testHorseOwner1.id, pensions[0].id)
				horseData.horsemen = [testHorseOwner1.id]
				horseData.additives = []
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testHorseOwner1.token}`)
					.send(horseData)
				response.should.have.status(201)
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
				response.body.errors
					.map(error => error.path)
					.should.eql(['ownerId', 'pensionId', 'name', 'horsemen', 'additives', 'comment'])
			})
		})

		describe('create invalid - sql (not null)', async function () {
			it('with role admin but does not matter', async function () {
				const data = {}
				try {
					await db.models.Horse.create(data)
				} catch (error) {
					error.errors.map(err => err.path).should.eql(['ownerId', 'name'])
				}
			})
		})
	})

	describe('update', async function () {
		// we do not care about the request etc as it is the same as create
		it('with role admin', async function () {
			const horse = await db.models.Horse.create({
				...HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id),
				horsemen: [testHorseOwner1.id],
				additives: [],
			})
			const data = {
				ownerId: testHorseOwner2.id,
				pensionId: pensions[1].id,
				name: 'updatedName',
				comment: 'updatedComment',
				horsemen: [testHorseOwner2.id],
				additives: [],
			}
			const response = await chai
				.request(app)
				.put(`${routePrefix}/${horse.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(data)

			response.should.have.status(200)
			response.body.should.have.property('id').eql(horse.id)
			response.body.should.have.property('name').eql(data.name)
			response.body.should.have.property('comment').eql(data.comment)
			response.body.should.have.property('createdAt')
			response.body.should.have.property('updatedAt')
			response.body.should.have.property('owner').eql({
				email: testHorseOwner2.email,
				userId: testHorseOwner2.id,
				firstName: testHorseOwner2Contact.firstName,
				lastName: testHorseOwner2Contact.lastName,
				phone: testHorseOwner2Contact.phone,
				mobile: testHorseOwner2Contact.mobile,
				address: testHorseOwner2Contact.address,
				invoicingAddress: testHorseOwner2Contact.invoicingAddress,
			})
			response.body.should.have.property('pension').eql({
				name: pensions[1].name,
				monthlyPrice: pensions[1].monthlyPrice,
				description: pensions[1].description,
			})
			response.body.horsemen[0].should.eql({
				email: testHorseOwner2.email,
				userId: testHorseOwner2.id,
				firstName: testHorseOwner2Contact.firstName,
				lastName: testHorseOwner2Contact.lastName,
				phone: testHorseOwner2Contact.phone,
				mobile: testHorseOwner2Contact.mobile,
				address: testHorseOwner2Contact.address,
				invoicingAddress: testHorseOwner2Contact.invoicingAddress,
			})
		})

		it('with role employee', async function () {
			const horse = await db.models.Horse.create({
				...HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id),
				horsemen: [testHorseOwner1.id],
				additives: [],
			})

			const data = {
				ownerId: testHorseOwner2.id,
				pensionId: pensions[1].id,
				name: 'updatedName',
				comment: 'updatedComment',
				horsemen: [testHorseOwner1.id],
				additives: [],
			}

			const response = await chai
				.request(app)
				.put(`${routePrefix}/${horse.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)
				.send(data)

			response.should.have.status(200)
		})

		it('with role client - not owner', async function () {
			const horse = await db.models.Horse.create({
				...HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id),
				horsemen: [testHorseOwner1.id],
				additives: [],
			})

			const data = {
				ownerId: testHorseOwner2.id,
				pensionId: pensions[1].id,
				name: 'updatedName',
				comment: 'updatedComment',
				horsemen: [testHorseOwner1.id],
				additives: [],
			}

			const response = await chai
				.request(app)
				.put(`${routePrefix}/${horse.id}`)
				.set('Authorization', `Bearer ${testHorseOwner2.token}`)
				.send(data)

			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('horse_unauthorized'))
		})

		it('with role client - owner with unauthorized owner change', async function () {
			const horse = await db.models.Horse.create({
				...HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id),
				horsemen: [testHorseOwner1.id],
				additives: [],
			})

			const data = {
				ownerId: testHorseOwner2.id,
				pensionId: pensions[1].id,
				name: 'updatedName',
				comment: 'updatedComment',
				horsemen: [testHorseOwner1.id],
				additives: [],
			}
			const response = await chai
				.request(app)
				.put(`${routePrefix}/${horse.id}`)
				.set('Authorization', `Bearer ${testHorseOwner1.token}`)
				.send(data)

			response.should.have.status(401)
			response.body.should.have.property('message').eql(i18next.t('horse_unauthorized_change_ownerId'))
		})

		it('with role client - owner and allowed change', async function () {
			const horse = await db.models.Horse.create({
				...HorseFactory.create(testHorseOwner1.id, ArrayUtils.getRandomElement(pensions).id),
				horsemen: [testHorseOwner1.id],
				additives: [],
			})

			const data = {
				ownerId: testHorseOwner1.id,
				pensionId: pensions[1].id,
				name: 'updatedName',
				comment: 'updatedComment',
				horsemen: [testHorseOwner1.id],
				additives: [],
			}
			const response = await chai
				.request(app)
				.put(`${routePrefix}/${horse.id}`)
				.set('Authorization', `Bearer ${testHorseOwner1.token}`)
				.send(data)
			response.should.have.status(200)
		})
	})
})
