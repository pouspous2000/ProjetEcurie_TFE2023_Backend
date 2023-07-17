import { Op } from 'sequelize'
import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { ContactFactory } from '@/modules/contact/factory'
import { RideFactory } from '@/modules/ride/factory'
import { HorseFactory } from '@/modules/horse/factory'
import { PensionFactory } from '@/modules/pension/factory'

chai.should()
chai.use(chaiHttp)

describe('RideData module', async function () {
	let testAdminUser, testEmployeeUser, testClientUser
	let testClientContact
	let roleAdmin, roleEmployee, roleClient

	beforeEach(async function () {
		await db.models.Horse.destroy({ truncate: { cascade: true } })
		await db.models.Ride.destroy({ truncate: { cascade: true }, force: true })
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

			const rideData = await db.models.RideData.findOne({
				where: {
					[Op.and]: [{ horseId: response.body.id }, { rideId: ride.id }, { deletedAt: null }],
				},
			})

			rideData.should.have.property('price').eql(ride.price)
			rideData.should.have.property('period').eql(ride.period)
			rideData.should.have.property('name').eql(ride.name)
		})

		it('update horse', async function () {
			const ride1 = await db.models.Ride.create(RideFactory.create('WORKINGDAYS'))
			const ride2 = await db.models.Ride.create(RideFactory.create('WEEKEND'))
			const pension = await db.models.Pension.create(PensionFactory.create())

			const data = {
				...HorseFactory.create(testClientUser.id, pension.id, ride1.id),
				horsemen: [testClientUser.id],
				additives: [],
			}

			const response1 = await chai
				.request(app)
				.post('/horses')
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(data)

			data.rideId = ride2.id

			const response = await chai
				.request(app)
				.put(`/horses/${response1.body.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(data)

			const rideDataDeleted = await db.models.RideData.findOne({
				where: {
					[Op.and]: [{ horseId: response1.body.id }, { rideId: ride1.id }, { deletedAt: { [Op.ne]: null } }],
				},
			})

			rideDataDeleted.should.have.property('price').eql(ride1.price)
			rideDataDeleted.should.have.property('period').eql(ride1.period)
			rideDataDeleted.should.have.property('name').eql(ride1.name)

			const currentRideData = await db.models.RideData.findOne({
				where: {
					[Op.and]: [{ horseId: response.body.id }, { rideId: ride2.id }, { deletedAt: null }],
				},
			})

			currentRideData.should.have.property('price').eql(ride2.price)
			currentRideData.should.have.property('period').eql(ride2.period)
			currentRideData.should.have.property('name').eql(ride2.name)
		})
	})

	describe('ride tests', async function () {
		it('update ride', async function () {
			const rideData = RideFactory.create('WORKINGDAYS')
			const ride = await db.models.Ride.create(rideData)
			const pension = await db.models.Pension.create(PensionFactory.create())
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

			const updatedRideData = { ...rideData }
			updatedRideData.price = 200

			const response2 = await chai
				.request(app)
				.put(`/rides/${ride.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
				.send(updatedRideData)

			const rideDataDeleted = await db.models.RideData.findOne({
				where: {
					[Op.and]: [{ horseId: response1.body.id }, { rideId: ride.id }, { deletedAt: { [Op.ne]: null } }],
				},
			})

			rideDataDeleted.should.have.property('name').eql(ride.name)
			rideDataDeleted.should.have.property('period').eql(ride.period)
			rideDataDeleted.should.have.property('price').eql(ride.price)

			const currentRideData = await db.models.RideData.findOne({
				where: {
					[Op.and]: [{ horseId: response1.body.id }, { deletedAt: null }],
				},
			})

			currentRideData.should.have.property('name').eql(response2.body.name)
			currentRideData.should.have.property('period').eql(response2.body.period)
			Number(currentRideData.price).should.eql(response2.body.price)
		})

		it('delete ride', async function () {
			const ride = await db.models.Ride.create(RideFactory.create('WORKINGDAYS'))
			const pension = await db.models.Pension.create(PensionFactory.create())
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

			await chai.request(app).delete(`/rides/${ride.id}`).set('Authorization', `Bearer ${testAdminUser.token}`)

			const rideDataDeleted = await db.models.RideData.findOne({
				where: {
					[Op.and]: [{ horseId: response1.body.id }, { rideId: ride.id }, { deletedAt: { [Op.ne]: null } }],
				},
			})

			rideDataDeleted.should.have.property('name').eql(ride.name)
			rideDataDeleted.should.have.property('period').eql(ride.period)
			rideDataDeleted.price.should.eql(ride.price)
		})
	})

	describe('owner test', async function () {
		it('rideData are deleted when owner is deleted', async function () {
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

			const rideData = await db.models.RideData.findOne({
				where: {
					[Op.and]: [{ horseId: horseCreateResponse.body.id }, { rideId: ride.id }, { deletedAt: null }],
				},
			})

			rideData.should.have.property('name').eql(ride.name)
			await testClientUser.destroy()

			const rideDatas = await db.models.RideData.findAll({ paranoid: false })
			rideDatas.should.have.length(0)
		})
	})
})
