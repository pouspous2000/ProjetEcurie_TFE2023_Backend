import { describe, it, beforeEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import { RoleFactory } from '@/modules/role/factory'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/roles'

describe('Role Module', function () {
	beforeEach(async function () {
		await db.models.Role.destroy({ truncate: true })
	})

	it('index', async function () {
		const roles = [RoleFactory.createAdmin(), RoleFactory.createEmployee(), RoleFactory.createClient()]
		await db.models.Role.bulkCreate(roles)
		const response = await chai.request(app).get(`${routePrefix}`)
		response.should.have.status(200)
		response.body.should.have.length(roles.length)
	})

	it('single valid', async function () {
		const admin = await db.models.Role.create(RoleFactory.createAdmin())
		const response = await chai.request(app).get(`${routePrefix}/${admin.id}`)
		response.should.have.status(200)
		response.body.should.have.property('name').eql(admin.name)
		response.body.should.have.property('isEditable').eql(false)
		response.body.should.have.property('parent').eql({})
		response.body.should.have.property('children').eql([])
		response.body.should.have.property('createdAt')
		response.body.should.have.property('updatedAt')
	})

	it('single 404', async function () {
		const response = await chai.request(app).get(`${routePrefix}/1`)
		response.should.have.status(404)
	})

	it('delete cascade editable', async function () {
		const rootRole = await db.models.Role.create(RoleFactory.create())
		const secondRoleObj = RoleFactory.create()
		secondRoleObj.parentId = rootRole.id
		await db.models.Role.create(secondRoleObj)

		const otherRole = await db.models.Role.create(RoleFactory.create())
		const response = await chai.request(app).delete(`${routePrefix}/${rootRole.id}`)
		response.should.have.status(204)

		const roles = await db.models.Role.findAll()
		roles.should.have.length(1)
		roles[0].dataValues.id.should.be.eql(otherRole.id)
	})

	it('delete non editable', async function () {
		const admin = await db.models.Role.create(RoleFactory.createAdmin())
		const response = await chai.request(app).delete(`${routePrefix}/${admin.id}`)
		response.should.have.status(401)

		const roles = await db.models.Role.findAll()
		roles.should.have.length(1)
		roles[0].dataValues.id.should.be.eql(admin.id)
	})

	it('create invalid - duplicate unique name', async function () {
		const firstRoleObj = RoleFactory.create()
		const firstRole = await db.models.Role.create(firstRoleObj)
		const response = await chai
			.request(app)
			.post(`${routePrefix}`)
			.send({
				...firstRoleObj,
				parentId: firstRole.id,
			})
		response.should.have.status(422)
		response.body.errors.should.have.length(1)
	})

	it('create invalid - missing name and invalid parentId', async function () {
		await db.models.Role.create(RoleFactory.createEmployee())
		const invalidRole = {
			parentId: -1,
		}
		const response = await chai.request(app).post(`${routePrefix}`).send(invalidRole)
		response.should.have.status(422)
		response.body.errors.should.have.length(3) // 2 errors for name and 1 for parentId
	})

	it('create valid', async function () {
		const employee = await db.models.Role.create(RoleFactory.createEmployee())
		const roleObj = RoleFactory.create()
		roleObj.parentId = employee.id
		const response = await chai.request(app).post(`${routePrefix}`).send(roleObj)
		response.should.have.status(201)
		response.body.should.have.property('name').eql(roleObj.name)
		response.body.should.have.property('parentId').eql(employee.id)
		response.body.should.have.property('isEditable').eql(true)
		response.body.should.have.property('createdAt')
		response.body.should.have.property('updatedAt')
	})

	it('update invalid non editable', async function () {
		const admin = await db.models.Role.create(RoleFactory.createAdmin())
		const response = await chai.request(app).put(`${routePrefix}/${admin.id}`).send({
			name: 'some other name',
		})
		response.should.have.status(422)
		response.body.errors.should.have.length(1)
	})

	it('update invalid - missing name and invalid parentId', async function () {
		const role = await db.models.Role.create(RoleFactory.create())
		const response = await chai.request(app).put(`${routePrefix}/${role.id}`).send({
			parentId: -1,
		})
		response.should.have.status(422)
		response.body.errors.should.have.length(3)
	})

	it('update valid', async function () {
		const employee = await db.models.Role.create(RoleFactory.createEmployee())
		const roleObj = RoleFactory.create()
		roleObj.parentId = employee.id
		const role = await db.models.Role.create(roleObj)

		const response = await chai.request(app).put(`${routePrefix}/${role.id}`).send({
			name: 'some valid name',
			parentId: role.parentId,
		})

		response.should.have.status(200)
		response.body.should.have.property('name').eql('Some valid name')
		response.body.should.have.property('parentId').eql(employee.id)
		response.body.should.have.property('isEditable').eql(true)
		response.body.should.have.property('createdAt')
		response.body.should.have.property('updatedAt')
	})
})
