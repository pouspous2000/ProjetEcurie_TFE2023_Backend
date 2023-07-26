import { Op } from 'sequelize'
import { describe, it, beforeEach, afterEach } from 'mocha'

import chaiHttp from 'chai-http'
import chai from 'chai'

import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { ContactFactory } from '@/modules/contact/factory'
import { PensionFactory } from '@/modules/pension/factory'
import { RideFactory } from '@/modules/ride/factory'

import app from '@/app'
import db from '@/database'

import i18next from '../../../i18n'
import { HorseFactory } from '@/modules/horse/factory'
import { AdditiveFactory } from '@/modules/additive/factory'
import { AdditiveDataService } from '@/modules/additive-data/service'

chai.should()
chai.use(chaiHttp)

describe('AdditiveData Module', function () {
	let testAdminUser, testEmployeeUser, testClientUser
	let testHorseOwner1, testHorseOwner2
	// eslint-disable-next-line no-unused-vars
	let testHorseOwner1Contact, testHorseOwner2Contact
	let pensions = []
	let rides = []
	let roleAdmin, roleEmployee, roleClient

	beforeEach(async function () {
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

		// tokens
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

	describe('add', async function () {
		let horse, additives

		beforeEach(async function () {
			horse = await db.models.Horse.create(HorseFactory.create(testHorseOwner1.id, pensions[0].id, rides[0].id))

			const additiveObjs = []
			for (let i = 0; i < 5; i++) {
				additiveObjs.push(AdditiveFactory.create())
			}

			additives = await db.models.Additive.bulkCreate(additiveObjs)
		})

		afterEach(function () {
			horse = undefined
			additives = undefined
		})

		describe('permissions', async function () {
			it('with role admin', async function () {
				const horseAdditives = additives.slice(0, 2)

				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/add`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({ additiveIds: horseAdditives.map(horseAdditive => horseAdditive.id) })

				response.should.have.status(201)
				response.body.should.have.property('id')
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
				response.body.should.have.property('horsemen').eql([])
				response.body.additiveDatas.should.have.length(2)
				response.body.additiveDatas.forEach(additiveData => {
					additiveData.should.have.keys('id', 'additiveId', 'name', 'price', 'status')
					additiveData.should.have.property('status').eql('ACTIVE')
				})
			})

			it('with role employee', async function () {
				const horseAdditives = additives.slice(0, 2)

				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/add`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send({ additiveIds: horseAdditives.map(horseAdditive => horseAdditive.id) })

				response.should.have.status(201)
			})

			describe('with role client', async function () {
				it('own horse - allowed', async function () {
					const horseAdditives = additives.slice(0, 2)

					const response = await chai
						.request(app)
						.post(`/horses/${horse.id}/add`)
						.set('Authorization', `Bearer ${testHorseOwner1.token}`)
						.send({ additiveIds: horseAdditives.map(horseAdditive => horseAdditive.id) })

					response.should.have.status(201)
				})

				it("other client's horse - not allowed", async function () {
					const horseAdditives = additives.slice(0, 2)

					const response = await chai
						.request(app)
						.post(`/horses/${horse.id}/add`)
						.set('Authorization', `Bearer ${testHorseOwner2.token}`)
						.send({ additiveIds: horseAdditives.map(horseAdditive => horseAdditive.id) })

					response.should.have.status(401)
					response.body.should.have.property('message').eql(i18next.t('additiveData_401'))
				})
			})
		})

		describe('middleware', async function () {
			it('missing mandatory additiveIds', async function () {
				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/add`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})

				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['additiveIds'])
			})
		})

		describe('service', async function () {
			it('inexisting horse', async function () {
				const lastHorse = await db.models.User.findOne({
					order: [['id', 'DESC']],
				})

				const horseAdditives = additives.slice(0, 2)

				const response = await chai
					.request(app)
					.post(`/horses/${lastHorse.id + 1}/add`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({ additiveIds: horseAdditives.map(horseAdditive => horseAdditive.id) })

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('additiveData_422_inexistingHorse'))
			})

			it('inexistingAdditive', async function () {
				const lastAdditive = await db.models.Additive.findOne({
					order: [['id', 'DESC']],
				})

				const horseAdditives = [...additives.slice(0, 2), lastAdditive.id + 1]
				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/add`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({ additiveIds: horseAdditives.map(horseAdditive => horseAdditive.id) })

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('additiveData_422_inexistingAdditive'))
			})
		})
	})

	describe('cancel', async function () {
		describe('permissions', async function () {
			let horse, additives, additiveDatas

			beforeEach(async function () {
				horse = await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, pensions[0].id, rides[0].id)
				)
				const additiveObjs = []
				for (let i = 0; i < 5; i++) {
					additiveObjs.push(AdditiveFactory.create())
				}

				additives = await db.models.Additive.bulkCreate(additiveObjs)
				additiveDatas = await db.models.AdditiveData.bulkCreate(
					additives.map(additive => ({
						additiveId: additive.id,
						horseId: horse.id,
						name: additive.name,
						price: additive.price,
						status: 'ACTIVE',
					}))
				)
			})

			afterEach(function () {
				horse = additives = additiveDatas = undefined
			})

			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/cancel`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({ additiveDataIds: additiveDatas.map(additiveData => additiveData.id) })

				response.should.have.status(201)
				response.body.should.have.property('id')
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
				response.body.should.have.property('horsemen').eql([])
				response.body.additiveDatas.should.have.length(additiveDatas.length)
				response.body.additiveDatas.forEach(additiveData => {
					additiveData.should.have.keys('id', 'additiveId', 'name', 'price', 'status')
					additiveData.should.have.property('status').eql('CANCELLED')
				})
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/cancel`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send({ additiveDataIds: additiveDatas.map(additiveData => additiveData.id) })

				response.should.have.status(201)
			})

			describe('with role client', async function () {
				it("other client's horse - not allowed", async function () {
					const response = await chai
						.request(app)
						.post(`/horses/${horse.id}/cancel`)
						.set('Authorization', `Bearer ${testHorseOwner2.token}`)
						.send({ additiveDataIds: additiveDatas.map(additiveData => additiveData.id) })

					response.should.have.status(401)
					response.body.should.have.property('message').eql(i18next.t('additiveData_401'))
				})

				it('own horse - allowed', async function () {
					const response = await chai
						.request(app)
						.post(`/horses/${horse.id}/cancel`)
						.set('Authorization', `Bearer ${testHorseOwner1.token}`)
						.send({ additiveDataIds: additiveDatas.map(additiveData => additiveData.id) })

					response.should.have.status(201)
				})
			})
		})

		describe('middleware', async function () {
			it('missing mandatory additiveDataIds', async function () {
				const horse = await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, pensions[0].id, rides[0].id)
				)
				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/cancel`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})

				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['additiveDataIds'])
			})
		})

		describe('service', async function () {
			let horse, additives, additiveDatas

			beforeEach(async function () {
				horse = await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, pensions[0].id, rides[0].id)
				)
				const additiveObjs = []
				for (let i = 0; i < 5; i++) {
					additiveObjs.push(AdditiveFactory.create())
				}

				additives = await db.models.Additive.bulkCreate(additiveObjs)
				additiveDatas = await db.models.AdditiveData.bulkCreate(
					additives.map(additive => ({
						additiveId: additive.id,
						horseId: horse.id,
						name: additive.name,
						price: additive.price,
						status: 'ACTIVE',
					}))
				)
			})

			afterEach(function () {
				horse = additives = additiveDatas = undefined
			})

			it('inexisting horse', async function () {
				const lastHorse = await db.models.User.findOne({
					order: [['id', 'DESC']],
				})

				const response = await chai
					.request(app)
					.post(`/horses/${lastHorse.id + 1}/cancel`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({ additiveDataIds: additiveDatas.map(additiveData => additiveData.id) })

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('additiveData_422_inexistingHorse'))
			})

			it('inexisting additiveData ', async function () {
				const lastAdditiveData = await db.models.AdditiveData.findOne({
					order: [['id', 'DESC']],
				})

				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/cancel`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({
						additiveDataIds: [
							...additiveDatas.map(additiveData => additiveData.id),
							lastAdditiveData.id + 1,
						],
					})

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('additiveData_422_404'))
			})

			it('inadequate status', async function () {
				const newAdditive = await db.models.Additive.create(AdditiveFactory.create())
				const inadequateStatusAdditiveData = await db.models.AdditiveData.create({
					additiveId: newAdditive.id,
					horseId: horse.id,
					name: newAdditive.name,
					price: newAdditive.price,
					status: 'INVOICED',
				})

				const response = await chai
					.request(app)
					.post(`/horses/${horse.id}/cancel`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({
						additiveDataIds: [
							...additiveDatas.map(additiveData => additiveData.id),
							inadequateStatusAdditiveData.id,
						],
					})

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('additiveData_422_status'))
			})
		})
	})

	describe('markAsInvoiced', async function () {
		describe('service', async function () {
			let horse, additives, additiveDatas, service

			beforeEach(async function () {
				service = new AdditiveDataService()
				horse = await db.models.Horse.create(
					HorseFactory.create(testHorseOwner1.id, pensions[0].id, rides[0].id)
				)
				const additiveObjs = []
				for (let i = 0; i < 5; i++) {
					additiveObjs.push(AdditiveFactory.create())
				}

				additives = await db.models.Additive.bulkCreate(additiveObjs)
				additiveDatas = await db.models.AdditiveData.bulkCreate(
					additives.map(additive => ({
						additiveId: additive.id,
						horseId: horse.id,
						name: additive.name,
						price: additive.price,
						status: 'ACTIVE',
					}))
				)
			})

			it('inadequate status', async function () {
				const newAdditive = await db.models.Additive.create(AdditiveFactory.create())
				const inadequateStatusAdditiveData = await db.models.AdditiveData.create({
					additiveId: newAdditive.id,
					horseId: horse.id,
					name: newAdditive.name,
					price: newAdditive.price,
					status: 'INVOICED',
				})

				//eslint-disable-next-line no-unexpected-multiline
				await (async () => {
					try {
						await service.markAsInvoiced([...additiveDatas, inadequateStatusAdditiveData])
					} catch (error) {
						error.should.have.property('message').eql(i18next.t('additiveData_422_status'))
					}
				})()
			})

			it('success', async function () {
				await service.markAsInvoiced(additiveDatas)
				const updatedAdditiveDatas = await db.models.AdditiveData.findAll({
					where: {
						id: {
							[Op.in]: additiveDatas.map(additiveData => additiveData.id),
						},
					},
				})

				if (updatedAdditiveDatas.length !== additiveDatas.length) {
					throw new Error('inconsistent update')
				}

				for (let i = 0; i < updatedAdditiveDatas.length; i++) {
					['additiveId', 'horseId', 'name', 'price'].forEach(field => {
						if (additiveDatas[i][field] !== updatedAdditiveDatas[i][field]) {
							throw new Error('inadequate field update')
						}
						if (updatedAdditiveDatas[i]['status'] !== 'INVOICED') {
							throw new Error('status updated to inappropriate value')
						}
					})
				}
			})
		})
	})
})
