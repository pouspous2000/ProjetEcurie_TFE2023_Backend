import { describe, it, beforeEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import { HorseContributorJobFactory } from '@/modules/horse-contributor-job/factory'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/horse_contributor_jobs'

describe('HorseContributorJob Module', function () {
	beforeEach(async function () {
		await db.models.HorseContributorJob.destroy({ truncate: true })
	})

	it('index', async function () {
		await db.models.HorseContributorJob.bulkCreate(HorseContributorJobFactory.bulkCreate(10))
		const response = await chai.request(app).get(`${routePrefix}`)
		response.should.have.status(200)
		response.body.should.have.length(10)
	})

	it('single', async function () {
		const veterinary = await db.models.HorseContributorJob.create(HorseContributorJobFactory.createVeterinary())

		const response = await chai.request(app).get(`${routePrefix}/${veterinary.id}`)
		response.should.have.status(200)
		response.body.should.have.property('name').eql(veterinary.name)
		response.body.should.have.property('createdAt')
		response.body.should.have.property('updatedAt')
	})
})
