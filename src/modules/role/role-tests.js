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
		response.body.should.have.length(3)
	})

	it('single valid', async function () {
		const admin = await db.models.Role.create(RoleFactory.createAdmin())
		const response = await chai.request(app).get(`${routePrefix}/${admin.id}`)
		response.should.have.status(200)
		response.body.should.have.property('name').eql(admin.name)
		response.body.should.have.property('createdAt')
		response.body.should.have.property('updatedAt')
	})

	it('single 404', async function () {
		const response = await chai.request(app).get(`${routePrefix}/1`)
		response.should.have.status(404)
	})
})
