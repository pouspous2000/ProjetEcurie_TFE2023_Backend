import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { ContactFactory } from '@/modules/contact/factory'
import { PensionFactory } from '@/modules/pension/factory'
import { HorseFactory } from '@/modules/horse/factory'
import { RideFactory } from '@/modules/ride/factory'
import { Op } from 'sequelize'
import i18next from '../../../i18n'

chai.should()
chai.use(chaiHttp)

describe('PensionData module', async function () {
	let testAdminUser, testEmployeeUser, testClientUser
	let testClientContact
	let roleAdmin, roleEmployee, roleClient

	beforeEach(async function () {
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

		testAdminUser.token = testAdminUser.generateToken()
		testEmployeeUser.token = testEmployeeUser.generateToken()
		testClientUser.token = testClientUser.generateToken()

		//create contacts
		testClientContact = await db.models.Contact.create(ContactFactory.create(testClientUser.id))
	})

	afterEach(function () {
		testAdminUser = testEmployeeUser = testClientUser = undefined
		testClientContact = undefined
		roleAdmin = roleEmployee = roleClient = undefined
	})

	describe('horse tests', async function () {
		it('add horse', async function () {
			const pension = await db.models.Pension.create(PensionFactory.create())
			const ride = await db.models.Ride.create(RideFactory.create('WORKINGDAYS'))
			const data = {
				...HorseFactory.create(testClientUser.id, pension.id, ride.id),
				horsemen: [testClientUser.id],
				additives: [],
			}
			const response = await chai
				.request(app)
				.post('/horses')
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(data)

			response.should.have.status(201)
			response.body.should.have.property('id')
			response.body.should.have.property('name').eql(data.name)
			response.body.should.have.property('comment').eql(data.comment)
			response.body.should.have.property('createdAt')
			response.body.should.have.property('updatedAt')
			response.body.should.have.property('owner').eql({
				email: testClientUser.email,
				userId: testClientUser.id,
				firstName: testClientContact.firstName,
				lastName: testClientContact.lastName,
				phone: testClientContact.phone,
				mobile: testClientContact.mobile,
				address: testClientContact.address,
				invoicingAddress: testClientContact.invoicingAddress,
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
			response.body.horsemen[0].should.eql({
				email: testClientUser.email,
				userId: testClientUser.id,
				firstName: testClientContact.firstName,
				lastName: testClientContact.lastName,
				phone: testClientContact.phone,
				mobile: testClientContact.mobile,
				address: testClientContact.address,
				invoicingAddress: testClientContact.invoicingAddress,
			})

			const pensionData = await db.models.PensionData.findOne({
				where: {
					[Op.and]: [{ horseId: response.body.id }, { pensionId: pension.id }, { deletedAt: null }],
				},
			})

			pensionData.should.have.property('name').eql(pension.name)
			pensionData.should.have.property('monthlyPrice').eql(pension.monthlyPrice)
			pensionData.should.have.property('description').eql(pension.description)
		})
		it('update horse', async function () {
			const pension1 = await db.models.Pension.create(PensionFactory.create())
			const pension2 = await db.models.Pension.create(PensionFactory.create())
			const ride = await db.models.Ride.create(RideFactory.create('WORKINGDAYS'))
			const data = {
				...HorseFactory.create(testClientUser.id, pension1.id, ride.id),
				horsemen: [testClientUser.id],
				additives: [],
			}

			const response1 = await chai
				.request(app)
				.post('/horses')
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(data)

			data.pensionId = pension2.id

			const response = await chai
				.request(app)
				.put(`/horses/${response1.body.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(data)

			const pensionDataDeleted = await db.models.PensionData.findOne({
				where: {
					[Op.and]: [
						{ horseId: response1.body.id },
						{ pensionId: pension1.id },
						{ deletedAt: { [Op.ne]: null } },
					],
				},
			})

			pensionDataDeleted.should.have.property('name').eql(pension1.name)
			pensionDataDeleted.should.have.property('monthlyPrice').eql(pension1.monthlyPrice)
			pensionDataDeleted.should.have.property('description').eql(pension1.description)

			const currentPensionData = await db.models.PensionData.findOne({
				where: {
					[Op.and]: [{ horseId: response.body.id }, { pensionId: pension2.id }, { deletedAt: null }],
				},
			})

			currentPensionData.should.have.property('name').eql(pension2.name)
			currentPensionData.should.have.property('monthlyPrice').eql(pension2.monthlyPrice)
			currentPensionData.should.have.property('description').eql(pension2.description)
		})
	})

	describe('pension tests', async function () {
		it('update pension', async function () {
			const pensionData = PensionFactory.create()
			const pension = await db.models.Pension.create(pensionData)
			const ride = await db.models.Ride.create(RideFactory.create('WORKINGDAYS'))
			const horseData = {
				...HorseFactory.create(testClientUser.id, pension.id, ride.id),
				horsemen: [testClientUser.id],
				additives: [],
			}
			const response1 = await chai
				.request(app)
				.post('/horses')
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(horseData)

			const updatedPensionData = {
				...pensionData,
			}
			updatedPensionData.monthlyPrice = Number(pensionData.monthlyPrice) + 20

			const response2 = await chai
				.request(app)
				.put(`/pensions/${pension.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(updatedPensionData)

			const pensionDataDeleted = await db.models.PensionData.findOne({
				where: {
					[Op.and]: [
						{ horseId: response1.body.id },
						{ pensionId: pension.id },
						{ deletedAt: { [Op.ne]: null } },
					],
				},
				paranoid: false,
			})

			pensionDataDeleted.should.have.property('name').eql(pensionData.name)
			pensionDataDeleted.should.have.property('monthlyPrice').eql(pensionData.monthlyPrice)
			pensionDataDeleted.should.have.property('description').eql(pensionData.description)

			const currentPensionData = await db.models.PensionData.findOne({
				where: {
					[Op.and]: [{ horseId: response1.body.id }, { pensionId: pension.id }, { deletedAt: null }],
				},
			})

			currentPensionData.should.have.property('name').eql(response2.body.name)
			Number(currentPensionData.monthlyPrice).should.eql(response2.body.monthlyPrice)
			currentPensionData.should.have.property('description').eql(response2.body.description)
		})

		it('delete pension', async function () {
			const pension = await db.models.Pension.create(PensionFactory.create())
			const ride = await db.models.Ride.create(RideFactory.create('WORKINGDAYS'))
			const horseData = {
				...HorseFactory.create(testClientUser.id, pension.id, ride.id),
				horsemen: [testClientUser.id],
				additives: [],
			}

			await chai
				.request(app)
				.post('/horses')
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(horseData)

			const response = await chai
				.request(app)
				.delete(`/pensions/${pension.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(422)
			response.body.should.have.property('message').eql(i18next.t('pension_422_cannotDeletePension'))
		})
	})

	describe('owner test', async function () {
		it('pensionData are deleted when owner is deleted', async function () {
			const pension = await db.models.Pension.create(PensionFactory.create())
			const ride = await db.models.Ride.create(RideFactory.create('WORKINGDAYS'))
			const data = {
				...HorseFactory.create(testClientUser.id, pension.id, ride.id),
				horsemen: [testClientUser.id],
				additives: [],
			}

			const horseCreateResponse = await chai
				.request(app)
				.post('/horses')
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(data)

			const pensionData = await db.models.PensionData.findOne({
				where: {
					[Op.and]: [
						{ horseId: horseCreateResponse.body.id },
						{ pensionId: pension.id },
						{ deletedAt: null },
					],
				},
			})

			pensionData.should.have.property('name').eql(pension.name)
			pensionData.should.have.property('monthlyPrice').eql(pension.monthlyPrice)
			pensionData.should.have.property('description').eql(pension.description)

			await testClientUser.destroy()

			const pensionDatas = await db.models.PensionData.findAll({ paranoid: false })
			pensionDatas.should.have.length(0)
		})
	})
})
