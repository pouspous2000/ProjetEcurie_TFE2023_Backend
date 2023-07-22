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

		it('with role admin - 404', async function () {
			const response = await chai
				.request(app)
				.get(`${routePrefix}/${1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)

			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('dailyRide_404'))
		})
	})

	describe('delete', async function () {
		describe('permissions', async function () {
			let pension, rideDay, ride, horse, task, dailyRide
			beforeEach(async function () {
				pension = await db.models.Pension.create(PensionFactory.create())
				rideDay = await db.models.Ride.create(RideFactory.create('DAY'))
				ride = await db.models.Ride.create(RideFactory.create('WEEKEND'))
				horse = await db.models.Horse.create(HorseFactory.create(testClientUser1.id, pension.id, ride.id))
				task = await db.models.Task.create(TaskFactory.create(testAdminUser.id, testAdminUser.id, 'PENDING'))
				dailyRide = await db.models.DailyRide.create({
					horseId: horse.id,
					rideId: rideDay.id,
					taskId: task.id,
					name: rideDay.id,
					period: rideDay.period,
					price: rideDay.price,
					createdAt: new Date(),
					deletedAt: null,
				})
			})
			afterEach(function () {
				pension = rideDay = ride = horse = task = dailyRide = undefined
			})

			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${dailyRide.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.should.have.status(204)

				const updatedTask = await db.models.Task.findByPk(task.id)
				updatedTask.should.have.property('status').eql('CANCELLED')
				const updatedDailyRide = await db.models.DailyRide.findByPk(dailyRide.id, { paranoid: false })
				updatedDailyRide.should.have.property('deletedAt').not.eql(null)
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${dailyRide.id}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
				response.should.have.status(204)

				const updatedTask = await db.models.Task.findByPk(task.id)
				updatedTask.should.have.property('status').eql('CANCELLED')
				const updatedDailyRide = await db.models.DailyRide.findByPk(dailyRide.id, { paranoid: false })
				updatedDailyRide.should.have.property('deletedAt').not.eql(null)
			})

			describe('with role client', async function () {
				it('own horse - allowed', async function () {
					const response = await chai
						.request(app)
						.delete(`${routePrefix}/${dailyRide.id}`)
						.set('Authorization', `Bearer ${testClientUser1.token}`)
					response.should.have.status(204)

					const updatedTask = await db.models.Task.findByPk(task.id)
					updatedTask.should.have.property('status').eql('CANCELLED')
					const updatedDailyRide = await db.models.DailyRide.findByPk(dailyRide.id, { paranoid: false })
					updatedDailyRide.should.have.property('deletedAt').not.eql(null)
				})

				it("other client's horse", async function () {
					const response = await chai
						.request(app)
						.delete(`${routePrefix}/${dailyRide.id}`)
						.set('Authorization', `Bearer ${testClientUser2.token}`)
					response.should.have.status(401)
					response.body.should.have.property('message').eql(i18next.t('dailyRide_unauthorized'))
				})
			})
		})
		describe('task status with role admin', async function () {
			let pension, rideDay, ride, horse
			beforeEach(async function () {
				pension = await db.models.Pension.create(PensionFactory.create())
				rideDay = await db.models.Ride.create(RideFactory.create('DAY'))
				ride = await db.models.Ride.create(RideFactory.create('WEEKEND'))
				horse = await db.models.Horse.create(HorseFactory.create(testClientUser1.id, pension.id, ride.id))
			})
			afterEach(function () {
				pension = rideDay = ride = horse = undefined
			})

			it("task status in ['IN PROGRESS', 'COMPLETED', 'BLOCKED']", async function () {
				const task = await db.models.Task.create(
					TaskFactory.create(testAdminUser.id, testAdminUser.id, 'COMPLETED')
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
					.delete(`${routePrefix}/${dailyRide.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('dailyRide_422_delete_when_status'))
			})

			it("task status in ['PENDING', 'CONFIRMED']", async function () {
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
					.delete(`${routePrefix}/${dailyRide.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(204)

				const updatedTask = await db.models.Task.findByPk(task.id)
				updatedTask.should.have.property('status').eql('CANCELLED')
				const updatedDailyRide = await db.models.DailyRide.findByPk(dailyRide.id, { paranoid: false })
				updatedDailyRide.should.have.property('deletedAt').not.eql(null)
			})

			it('task status is CANCELLED', async function () {
				const task = await db.models.Task.create(
					TaskFactory.create(testAdminUser.id, testAdminUser.id, 'CANCELLED')
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

				await chai
					.request(app)
					.delete(`${routePrefix}/${dailyRide.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				const updatedTask = await db.models.Task.findByPk(task.id)
				updatedTask.should.have.property('status').eql('CANCELLED')
				const updatedDailyRide = await db.models.DailyRide.findByPk(dailyRide.id, { paranoid: false })
				updatedDailyRide.should.have.property('deletedAt').not.eql(null)
			})
		})
		it('with role admin - 404', async function () {
			const response = await chai
				.request(app)
				.delete(`${routePrefix}/${1}`)
				.set('Authorization', `Bearer ${testAdminUser.token}`)
			response.should.have.status(404)
			response.body.should.have.property('message').eql(i18next.t('dailyRide_404'))
		})
	})

	describe('create', async function () {
		describe('permissions', async function () {
			let pension, rideDay, ride, horse, data
			beforeEach(async function () {
				pension = await db.models.Pension.create(PensionFactory.create())
				rideDay = await db.models.Ride.create(RideFactory.create('DAY'))
				ride = await db.models.Ride.create(RideFactory.create('WEEKEND'))
				horse = await db.models.Horse.create(HorseFactory.create(testClientUser1.id, pension.id, ride.id))
				data = {
					horseId: horse.id,
					task: {
						startingAt: new Date(new Date().getTime() + 24 * 60 * 3600 * 1000),
						remark: 'this is a good remark ... isnt it ?',
					},
				}
			})

			afterEach(function () {
				pension = rideDay = ride = horse = data = undefined
			})

			it('role admin', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(201)
				response.body.should.have.property('id')
				response.body.should.have.property('name').eql(rideDay.name)
				response.body.should.have.property('period').eql(rideDay.period)
				response.body.should.have.property('price').eql(rideDay.price)
				response.body.should.have.property('horse').eql({
					id: horse.id,
					ownerId: horse.ownerId,
					pensionId: horse.pensionId,
					name: horse.name,
					comment: horse.comment,
				})
				response.body.task.should.have.property('id')
				response.body.task.name
					.toLowerCase()
					.should.eql(`${i18next.t('dailyRide')} ${horse.name}`.toLowerCase())
				response.body.task.description
					.toLowerCase()
					.should.eql(`${i18next.t('dailyRide')} ${horse.name}`.toLowerCase())
				response.body.task.should.have.property('status').eql('PENDING')
				response.body.task.should.have.property('remark').eql(data.task.remark)
				new Date(response.body.task.startingAt).getTime().should.eql(data.task.startingAt.getTime())
				response.body.task.should.have.property('endingAt').should.not.eql(null)
				response.body.should.have.property('createdAt')
				response.body.should.have.property('deletedAt').eql(null)
			})

			it('role employee', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(data)

				response.should.have.status(201)
			})

			describe('role client', async function () {
				it('own horse - allowed', async function () {
					const response = await chai
						.request(app)
						.post(`${routePrefix}`)
						.set('Authorization', `Bearer ${testClientUser1.token}`)
						.send(data)

					response.should.have.status(201)
				})

				it("other employee's horse - not allowed", async function () {
					const response = await chai
						.request(app)
						.post(`${routePrefix}`)
						.set('Authorization', `Bearer ${testClientUser2.token}`)
						.send(data)

					response.should.have.status(401)
					response.body.should.have.property('message').eql(i18next.t('dailyRide_unauthorized'))
				})
			})
		})

		describe('middleware', async function () {
			it('null mandatory values i.e horseId and task', async function () {
				// we do not test every validation rule as it is non-sense
				const data = {}
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['horseId', 'task', 'task.startingAt'])
			})
		})

		describe('service - 422 errors', async function () {
			let pension, ride, horse, rideDay

			beforeEach(async function () {
				pension = await db.models.Pension.create(PensionFactory.create())
				ride = await db.models.Ride.create(RideFactory.create('WEEKEND'))
				horse = await db.models.Horse.create(HorseFactory.create(testClientUser1.id, pension.id, ride.id))
				rideDay = await db.models.Ride.create(RideFactory.create('DAY'))
			})

			afterEach(function () {
				pension = ride = horse = rideDay = undefined
			})

			it('inexisting horse', async function () {
				const data = {
					horseId: horse.id + 1,
					task: {
						startingAt: new Date(new Date().getTime() + 24 * 60 * 3600 * 1000),
						remark: 'this is a good remark ... isnt it ?',
					},
				}
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('dailyRide_422_inexistingHorse'))
			})

			it('inexisting ride', async function () {
				await rideDay.destroy()
				const data = {
					horseId: horse.id,
					task: {
						startingAt: new Date(new Date().getTime() + 24 * 60 * 3600 * 1000),
						remark: 'this is a good remark ... isnt it ?',
					},
				}
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('dailyRide_422_inexistingRideDay'))
			})

			it('inexisting admin user', async function () {
				await testAdminUser.destroy()
				const data = {
					horseId: horse.id,
					task: {
						startingAt: new Date(new Date().getTime() + 24 * 60 * 3600 * 1000),
						remark: 'this is a good remark ... isnt it ?',
					},
				}
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(data)
				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('dailyRide_422_inexistingAdminUser'))
			})
		})
	})

	describe('update', async function () {
		describe('permissions', async function () {
			let pension, rideDay, ride, horse, dailyRide, task

			beforeEach(async function () {
				pension = await db.models.Pension.create(PensionFactory.create())
				rideDay = await db.models.Ride.create(RideFactory.create('DAY'))
				ride = await db.models.Ride.create(RideFactory.create('WEEKEND'))
				horse = await db.models.Horse.create(HorseFactory.create(testClientUser1.id, pension.id, ride.id))
				task = await db.models.Task.create(TaskFactory.create(testAdminUser.id, testAdminUser.id, 'PENDING'))
				dailyRide = await db.models.DailyRide.create({
					horseId: horse.id,
					rideId: rideDay.id,
					taskId: task.id,
					name: rideDay.id,
					period: rideDay.period,
					price: rideDay.price,
					createdAt: new Date(),
					deletedAt: null,
				})
			})

			afterEach(function () {
				pension = rideDay = ride = horse = dailyRide = task = undefined
			})

			it('role admin', async function () {
				const data = {
					task: {
						startingAt: new Date(new Date(task.startingAt).getTime() + 24 * 60 * 3600 * 1000),
						remark: 'this is another good remark ... isnt it ?',
					},
				}
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${dailyRide.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				task = await db.models.Task.findByPk(task.id)
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
					status: 'PENDING',
					startingAt: task.startingAt.toISOString(),
					endingAt: task.endingAt.toISOString(),
				})
				response.body.should.have.property('createdAt')
				response.body.should.have.property('deletedAt').eql(null)
			})

			it('role employee', async function () {
				const data = {
					task: {
						startingAt: new Date(new Date(task.startingAt).getTime() + 24 * 60 * 3600 * 1000),
						remark: 'this is another good remark ... isnt it ?',
					},
				}
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${dailyRide.id}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
					.send(data)
				response.should.have.status(200)
			})

			describe('role client', async function () {
				it('own horse - allowed', async function () {
					const data = {
						task: {
							startingAt: new Date(new Date(task.startingAt).getTime() + 24 * 60 * 3600 * 1000),
							remark: 'this is another good remark ... isnt it ?',
						},
					}
					const response = await chai
						.request(app)
						.put(`${routePrefix}/${dailyRide.id}`)
						.set('Authorization', `Bearer ${testClientUser1.token}`)
						.send(data)
					response.should.have.status(200)
				})

				it("other employee's horse - not allowed", async function () {
					const data = {
						task: {
							startingAt: new Date(new Date(task.startingAt).getTime() + 24 * 60 * 3600 * 1000),
							remark: 'this is another good remark ... isnt it ?',
						},
					}
					const response = await chai
						.request(app)
						.put(`${routePrefix}/${dailyRide.id}`)
						.set('Authorization', `Bearer ${testClientUser2.token}`)
						.send(data)
					response.should.have.status(401)
					response.body.should.have.property('message').eql(i18next.t('dailyRide_unauthorized'))
				})
			})
		})

		describe('middleware', async function () {
			it('null mandatory values task', async function () {
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
				const data = {}
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${dailyRide.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['task', 'task.startingAt'])
			})
		})

		describe('service - 422 errors', async function () {
			let pension, rideDay, ride, horse

			beforeEach(async function () {
				pension = await db.models.Pension.create(PensionFactory.create())
				rideDay = await db.models.Ride.create(RideFactory.create('DAY'))
				ride = await db.models.Ride.create(RideFactory.create('WEEKEND'))
				horse = await db.models.Horse.create(HorseFactory.create(testClientUser1.id, pension.id, ride.id))
			})

			afterEach(function () {
				pension = rideDay = ride = horse = undefined
			})

			it('status in [IN PROGRESS, COMPLETED, BLOCKED]', async function () {
				const task = await db.models.Task.create(
					TaskFactory.create(testAdminUser.id, testAdminUser.id, 'COMPLETED')
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

				const data = {
					task: {
						startingAt: new Date(new Date(task.startingAt).getTime() + 24 * 60 * 3600 * 1000),
						remark: 'this is another good remark ... isnt it ?',
					},
				}

				const response = await chai
					.request(app)
					.put(`${routePrefix}/${dailyRide.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('dailyRide_422_update_when_status'))
			})

			it('status in [PENDING, CONFIRMED]', async function () {
				const task = await db.models.Task.create(
					TaskFactory.create(testAdminUser.id, testAdminUser.id, 'CONFIRMED')
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

				const data = {
					task: {
						startingAt: new Date(new Date(task.startingAt).getTime() + 24 * 60 * 3600 * 1000),
						remark: 'this is another good remark ... isnt it ?',
					},
				}

				const response = await chai
					.request(app)
					.put(`${routePrefix}/${dailyRide.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(200)
			})

			it('status cancelled', async function () {
				const task = await db.models.Task.create(
					TaskFactory.create(testAdminUser.id, testAdminUser.id, 'CANCELLED')
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

				const data = {
					task: {
						startingAt: new Date(new Date(task.startingAt).getTime() + 24 * 60 * 3600 * 1000),
						remark: 'this is another good remark ... isnt it ?',
					},
				}

				const response = await chai
					.request(app)
					.put(`${routePrefix}/${dailyRide.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(data)

				response.should.have.status(422)
				response.body.should.have.property('message').eql(i18next.t('dailyRide_422_update_when_cancelled'))
			})
		})
	})
})
