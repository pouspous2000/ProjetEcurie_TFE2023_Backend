import { describe, it, beforeEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import { StableFactory } from '@/modules/stable/factory'

import app from '@/app'
import db from '@/database'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/stables'

describe('Stable Module', function () {
	beforeEach(async function () {
		await db.models.Stable.destroy({ truncate: true })
	})

	it('single valid', async function () {
		const bonnet = await db.models.Stable.create(StableFactory.createBonnet())
		const response = await chai.request(app).get(`${routePrefix}/${bonnet.id}`)
		response.should.have.status(200)
		response.body.should.have.property('name').eql(bonnet.name)
		response.body.should.have.property('vat').eql(bonnet.vat)
		response.body.should.have.property('phone').eql(bonnet.phone)
		response.body.should.have.property('email').eql(bonnet.email)
		response.body.should.have.property('invoiceNb').eql(bonnet.invoiceNb)
		response.body.should.have.property('invoicePrefix').eql(bonnet.invoicePrefix)
		response.body.should.have.property('createdAt')
		response.body.should.have.property('updatedAt')
	})

	it('single 404', async function () {
		const response = await chai.request(app).get(`${routePrefix}/1`)
		response.should.have.status(404)
	})
})
