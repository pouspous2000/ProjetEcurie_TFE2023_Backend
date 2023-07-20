import { describe, it, beforeEach, afterEach } from 'mocha'
import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '@/app'
import db from '@/database'

import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { TaskFactory } from '@/modules/task/factory'
import { RideFactory } from '@/modules/ride/factory'
import { HorseFactory } from '@/modules/horse/factory'
import { PensionFactory } from '@/modules/pension/factory'

import i18next from '../../../i18n'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/daily-rides'

describe('DailyRide module', async function () {
	let roleAdmin, roleEmployee, roleClient
	let testAdminUser, testEmployeeUser, testClientUser1, testClientUser2

	beforeEach(async function () {
		await db.models.DailyRide.destroy({ truncate: { cascade: true }, force: true })
		await db.models.Task.destroy({ truncate: { cascade: true } })
		await db.models.Ride.destroy({ truncate: { cascade: true }, force: true })
		await db.models.Pension.destroy({ truncate: { cascade: true }, force: true })
		await db.models.User.destroy({ truncate: { cascade: true } })
		await db.models.Role.destroy({ truncate: { cascade: true } })

		//create roles
		roleAdmin = await db.models.Role.create(RoleFactory.createAdmin())
		roleEmployee = await db.models.Role.create(RoleFactory.createEmployee())
		roleClient = await db.models.Role.create(RoleFactory.createClient())

		//create users
		testAdminUser = await db.models.User.create(UserFactory.create(roleAdmin.id))
		testEmployeeUser = await db.models.User.create(UserFactory.create(roleEmployee.id))
		testClientUser1 = await db.models.User.create(UserFactory.create(roleClient.id))
		testClientUser2 = await db.models.User.create(UserFactory.create(roleClient.id))

		//generate tokens
		testAdminUser.token = testAdminUser.generateToken()
		testEmployeeUser.token = testEmployeeUser.generateToken()
		testClientUser1.token = testClientUser1.generateToken()
		testClientUser2.token = testClientUser2.generateToken()
	})

	afterEach(function () {
		roleAdmin = roleEmployee = roleClient = undefined
		testAdminUser = testEmployeeUser = testClientUser1 = testClientUser2 = undefined
	})

	describe('index', async function () {
		it('with role admin', async function () {
			const nbDailyRides = 10
			const pension = await db.models.Pension.create(PensionFactory.create())
			const rideDay = await db.models.Ride.create(RideFactory.create('DAY'))
			const ride = await db.models.Ride.create(RideFactory.create('WEEKEND'))
			const horse = await db.models.Horse.create(HorseFactory.create(testClientUser1.id, pension.id, ride.id))

			const taskObjs = []
			for (let i = 0; i < nbDailyRides; i++) {
				taskObjs.push(TaskFactory.create(testAdminUser.id, testAdminUser.id, 'PENDING'))
			}
			const tasks = await db.models.Task.bulkCreate(taskObjs)

			const dailyRideObjs = tasks.map(task => {
				return {
					horseId: horse.id,
					rideId: rideDay.id,
					taskId: task.id,
					name: rideDay.name,
					period: rideDay.period,
					price: rideDay.price,
					createdAt: new Date(),
					deletedAt: null,
				}
			})

			const dailyRides = await db.models.DailyRide.bulkCreate(dailyRideObjs)

			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.length(dailyRides.length)
		})

		it('with role employee', async function () {
			const nbDailyRides = 10
			const pension = await db.models.Pension.create(PensionFactory.create())
			const rideDay = await db.models.Ride.create(RideFactory.create('DAY'))
			const ride = await db.models.Ride.create(RideFactory.create('WEEKEND'))
			const horse = await db.models.Horse.create(HorseFactory.create(testClientUser1.id, pension.id, ride.id))

			const taskObjs = []
			for (let i = 0; i < nbDailyRides; i++) {
				taskObjs.push(TaskFactory.create(testAdminUser.id, testAdminUser.id, 'PENDING'))
			}
			const tasks = await db.models.Task.bulkCreate(taskObjs)

			const dailyRideObjs = tasks.map(task => {
				return {
					horseId: horse.id,
					rideId: rideDay.id,
					taskId: task.id,
					name: rideDay.name,
					period: rideDay.period,
					price: rideDay.price,
					createdAt: new Date(),
					deletedAt: null,
				}
			})

			const dailyRides = await db.models.DailyRide.bulkCreate(dailyRideObjs)

			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)

			response.should.have.status(200)
			response.body.should.have.length(dailyRides.length)
		})

		it('with role client', async function () {
			const nbDailyRidesUser1 = 10
			const nbDailyRidesUser2 = 5

			const pension = await db.models.Pension.create(PensionFactory.create())
			const rideDay = await db.models.Ride.create(RideFactory.create('DAY'))
			const ride = await db.models.Ride.create(RideFactory.create('WEEKEND'))

			const horseUser1 = await db.models.Horse.create(
				HorseFactory.create(testClientUser1.id, pension.id, ride.id)
			)
			const horseUser2 = await db.models.Horse.create(
				HorseFactory.create(testClientUser2.id, pension.id, ride.id)
			)

			const tasksObjUser1 = []
			for (let i = 0; i < nbDailyRidesUser1; i++) {
				tasksObjUser1.push(TaskFactory.create(testAdminUser.id, testAdminUser.id, 'PENDING'))
			}
			const tasksUser1 = await db.models.Task.bulkCreate(tasksObjUser1)

			const dailyRideUser1Objs = tasksUser1.map(task => {
				return {
					horseId: horseUser1.id,
					rideId: rideDay.id,
					taskId: task.id,
					name: rideDay.name,
					period: rideDay.period,
					price: rideDay.price,
					createdAt: new Date(),
					deletedAt: null,
				}
			})

			const dailyRidesUser1 = await db.models.DailyRide.bulkCreate(dailyRideUser1Objs)

			const tasksObjUser2 = []
			for (let i = 0; i < nbDailyRidesUser2; i++) {
				tasksObjUser1.push(TaskFactory.create(testAdminUser.id, testAdminUser.id, 'PENDING'))
			}
			const tasksUser2 = await db.models.Task.bulkCreate(tasksObjUser2)

			const dailyRideUser2Objs = tasksUser2.map(task => {
				return {
					horseId: horseUser2.id,
					rideId: rideDay.id,
					taskId: task.id,
					name: rideDay.name,
					period: rideDay.period,
					price: rideDay.price,
					createdAt: new Date(),
					deletedAt: null,
				}
			})

			await db.models.DailyRide.bulkCreate(dailyRideUser2Objs)

			const response = await chai
				.request(app)
				.get(`${routePrefix}`)
				.set('Authorization', `Bearer ${testClientUser1.token}`)

			response.should.have.status(200)
			response.body.should.have.length(dailyRidesUser1.length)
		})
	})

	describe('show', async function () {
		it('with role admin', async function () {
			const pension = await db.models.Pension.create(PensionFactory.create())
			const rideDay = await db.models.Ride.create(RideFactory.create('DAY'))
			const ride = await db.models.Ride.create(RideFactory.create('WEEKEND'))
			const horse = await db.models.Horse.create(HorseFactory.create(testClientUser1.id, pension.id, ride.id))
			const task = await db.models.Task.create(TaskFactory.create(testAdminUser.id, testAdminUser.id, 'PENDING'))
			const dailyRide = await db.models.DailyRide.create({
				horseId: horse.id,
				rideId: rideDay.id,
				taskId: task.id,
				name: rideDay.id,
				period: rideDay.period,
				price: rideDay.price,
				createdAt: new Date(),
				deletedAt: null,
			})

			const response = await chai
				.request(app)
				.get(`${routePrefix}/${dailyRide.id}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(200)
			response.body.should.have.property('id').eql(dailyRide.id)
			response.body.should.have.property('name').eql(dailyRide.name)
			response.body.should.have.property('period').eql(dailyRide.period)
			response.body.should.have.property('price').eql(dailyRide.price)
			response.body.should.have.property('horse').eql({
				id: horse.id,
				ownerId: horse.ownerId,
				pensionId: horse.pensionId,
				name: horse.name,
				comment: horse.comment,
			})
			response.body.should.have.property('task').eql({
				id: task.id,
				name: task.name,
				description: task.description,
				remark: task.remark,
				status: task.status,
				startingAt: task.startingAt.toISOString(),
				endingAt: task.endingAt.toISOString(),
			})
			response.body.should.have.property('createdAt')
			response.body.should.have.property('deletedAt').eql(null)
		})

		it('with role employee', async function () {
			const pension = await db.models.Pension.create(PensionFactory.create())
			const rideDay = await db.models.Ride.create(RideFactory.create('DAY'))
			const ride = await db.models.Ride.create(RideFactory.create('WEEKEND'))
			const horse = await db.models.Horse.create(HorseFactory.create(testClientUser1.id, pension.id, ride.id))
			const task = await db.models.Task.create(TaskFactory.create(testAdminUser.id, testAdminUser.id, 'PENDING'))
			const dailyRide = await db.models.DailyRide.create({
				horseId: horse.id,
				rideId: rideDay.id,
				taskId: task.id,
				name: rideDay.id,
				period: rideDay.period,
				price: rideDay.price,
				createdAt: new Date(),
				deletedAt: null,
			})

			const response = await chai
				.request(app)
				.get(`${routePrefix}/${dailyRide.id}`)
				.set('Authorization', `Bearer ${testEmployeeUser.token}`)

			response.should.have.status(200)
		})

		describe('with role client', async function () {
			it('own horse - allowed', async function () {
				const pension = await db.models.Pension.create(PensionFactory.create())
				const rideDay = await db.models.Ride.create(RideFactory.create('DAY'))
				const ride = await db.models.Ride.create(RideFactory.create('WEEKEND'))
				const horse = await db.models.Horse.create(HorseFactory.create(testClientUser1.id, pension.id, ride.id))
				const task = await db.models.Task.create(
					TaskFactory.create(testAdminUser.id, testAdminUser.id, 'PENDING')
				)
				const dailyRide = await db.models.DailyRide.create({
					horseId: horse.id,
					rideId: rideDay.id,
					taskId: task.id,
					name: rideDay.id,
					period: rideDay.period,
					price: rideDay.price,
					createdAt: new Date(),
					deletedAt: null,
				})

				const response = await chai
					.request(app)
					.get(`${routePrefix}/${dailyRide.id}`)
					.set('Authorization', `Bearer ${testClientUser1.token}`)

				response.should.have.status(200)
			})

			it("other client's horse - not allowed", async function () {
				const pension = await db.models.Pension.create(PensionFactory.create())
				const rideDay = await db.models.Ride.create(RideFactory.create('DAY'))
				const ride = await db.models.Ride.create(RideFactory.create('WEEKEND'))
				const horse = await db.models.Horse.create(HorseFactory.create(testClientUser1.id, pension.id, ride.id))
				const task = await db.models.Task.create(
					TaskFactory.create(testAdminUser.id, testAdminUser.id, 'PENDING')
				)
				const dailyRide = await db.models.DailyRide.create({
					horseId: horse.id,
					rideId: rideDay.id,
					taskId: task.id,
					name: rideDay.id,
					period: rideDay.period,
					price: rideDay.price,
					createdAt: new Date(),
					deletedAt: null,
				})

				const response = await chai
					.request(app)
					.get(`${routePrefix}/${dailyRide.id}`)
					.set('Authorization', `Bearer ${testClientUser2.token}`)

				response.should.have.status(401)
				response.body.should.have.property('message').eql(i18next.t('dailyRide_unauthorized'))
			})
		})
	})
})
