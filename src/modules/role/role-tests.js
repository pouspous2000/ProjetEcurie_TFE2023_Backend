import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/roles'

describe('Role Module', function () {
	let testAdmin, testEmployee, testClient

	beforeEach(async function () {
		await db.models.User.destroy({ truncate: { cascade: true } })
		await db.models.Role.destroy({ truncate: { cascade: true } })

		const roles = await db.models.Role.bulkCreate([
			RoleFactory.createAdmin(),
			RoleFactory.createEmployee(),
			RoleFactory.createClient(),
		])

		testAdmin = await db.models.User.create(
			UserFactory.createTestAdmin(roles.find(role => role.name === 'ADMIN').id)
		)
		testEmployee = await db.models.User.create(
			UserFactory.createTestEmployee(roles.find(role => role.name === 'EMPLOYEE').id)
		)
		testClient = await db.models.User.create(
			UserFactory.createTestClient(roles.find(role => role.name === 'CLIENT').id)
		)

		testAdmin.token = testAdmin.generateToken()
		testEmployee.token = testEmployee.generateToken()
		testClient.token = testClient.generateToken()
	})

	afterEach(function () {
		testAdmin = testEmployee = testClient = undefined
	})

	it('index', async function () {
		const response = await chai
			.request(app)
			.get(`${routePrefix}`)
			.set('Authorization', `Bearer ${testClient.token}`)
		response.should.have.status(200)
		response.body.should.have.length(3)
	})

	it('single valid', async function () {
		const response = await chai
			.request(app)
			.get(`${routePrefix}/${testAdmin.roleId}`)
			.set('Authorization', `Bearer ${testClient.token}`)
		response.should.have.status(200)
		response.body.should.have.property('name').eql('ADMIN')
		response.body.should.have.property('isEditable').eql(false)
		response.body.should.have.property('parent').eql({})
		response.body.should.have.property('children').eql([])
		response.body.should.have.property('createdAt')
		response.body.should.have.property('updatedAt')
	})

	it('single 404', async function () {
		const response = await chai
			.request(app)
			.get(`${routePrefix}/1`)
			.set('Authorization', `Bearer ${testClient.token}`)
		response.should.have.status(404)
	})

	it('delete cascade editable - admin', async function () {
		const rootRoleObj = { ...RoleFactory.create(), parentId: testClient.roleId }
		const rootRole = await db.models.Role.create(rootRoleObj)
		const secondRoleObj = RoleFactory.create()
		secondRoleObj.parentId = rootRole.id
		await db.models.Role.create(secondRoleObj)
		const response = await chai
			.request(app)
			.delete(`${routePrefix}/${rootRole.id}`)
			.set('Authorization', `Bearer ${testAdmin.token}`)
		response.should.have.status(204)
		const roles = await db.models.Role.findAll()
		roles.should.have.length(3)
	})

	it('delete - client', async function () {
		const roleObj = { ...RoleFactory.create(), parentId: testEmployee.roleId }
		const roleDb = await db.models.Role.create(roleObj)
		const response = await chai
			.request(app)
			.delete(`${routePrefix}/${roleDb.id}`)
			.set('Authorization', `Bearer ${testClient.token}`)
		response.should.have.status(401)
	})

	it('delete non editable', async function () {
		const response = await chai.request(app).delete(`${routePrefix}/${testAdmin.roleId}`)
		response.should.have.status(401)
		const roles = await db.models.Role.findAll()
		roles.should.have.length(3)
	})

	it('create invalid - duplicate unique name', async function () {
		const firstRoleObj = RoleFactory.create()
		const firstRole = await db.models.Role.create(firstRoleObj)
		const response = await chai
			.request(app)
			.post(`${routePrefix}`)
			.set('Authorization', `Bearer ${testAdmin.token}`)
			.send({
				...firstRoleObj,
				parentId: firstRole.id,
			})
		response.should.have.status(422)
		response.body.errors.should.have.length(1)
	})

	it('create invalid - missing name and invalid parentId', async function () {
		const invalidRole = {
			parentId: -1,
		}
		const response = await chai
			.request(app)
			.post(`${routePrefix}`)
			.send(invalidRole)
			.set('Authorization', `Bearer ${testAdmin.token}`)
		response.should.have.status(422)
		response.body.errors.should.have.length(2) // name and parentId we do not check error messages
	})

	it('create valid - admin', async function () {
		const roleObj = { ...RoleFactory.create(), parentId: testEmployee.roleId }
		const response = await chai
			.request(app)
			.post(`${routePrefix}`)
			.send(roleObj)
			.set('Authorization', `Bearer ${testAdmin.token}`)
		response.should.have.status(201)
		response.body.should.have.property('name').eql(roleObj.name)
		response.body.should.have.property('parentId').eql(testEmployee.roleId)
		response.body.should.have.property('isEditable').eql(true)
		response.body.should.have.property('createdAt')
		response.body.should.have.property('updatedAt')
	})

	it('create valid BUT from client', async function () {
		const roleObj = { ...RoleFactory.create(), parentId: testEmployee.roleId }
		const response = await chai
			.request(app)
			.post(`${routePrefix}`)
			.send(roleObj)
			.set('Authorization', `Bearer ${testClient.token}`)
		response.should.have.status(401)
	})

	it('update invalid non editable', async function () {
		const response = await chai
			.request(app)
			.put(`${routePrefix}/${testAdmin.roleId}`)
			.send({
				name: 'some other name',
			})
			.set('Authorization', `Bearer ${testAdmin.token}`)
		response.should.have.status(422)
		response.body.errors.should.have.length(1)
	})

	it('update invalid - missing name and invalid parentId', async function () {
		const role = await db.models.Role.create({ ...RoleFactory.create(), parentId: testClient.roleId })
		const response = await chai
			.request(app)
			.put(`${routePrefix}/${role.id}`)
			.send({
				parentId: -1,
			})
			.set('Authorization', `Bearer ${testAdmin.token}`)
		response.should.have.status(422)
		response.body.errors.should.have.length(2)
	})

	it('update valid', async function () {
		const role = await db.models.Role.create({ ...RoleFactory.create(), parentId: testEmployee.roleId })
		const response = await chai
			.request(app)
			.put(`${routePrefix}/${role.id}`)
			.send({
				name: 'some valid name',
				parentId: role.parentId,
			})
			.set('Authorization', `Bearer ${testAdmin.token}`)

		response.should.have.status(200)
		response.body.should.have.property('name').eql('Some valid name')
		response.body.should.have.property('parentId').eql(testEmployee.roleId)
		response.body.should.have.property('isEditable').eql(true)
		response.body.should.have.property('createdAt')
		response.body.should.have.property('updatedAt')
	})

	it('update valid - BUT client', async function () {
		const role = await db.models.Role.create({ ...RoleFactory.create(), parentId: testEmployee.roleId })
		const response = await chai
			.request(app)
			.put(`${routePrefix}/${role.id}`)
			.send({
				name: 'some valid name',
				parentId: role.parentId,
			})
			.set('Authorization', `Bearer ${testClient.token}`)

		response.should.have.status(401)
	})
})
