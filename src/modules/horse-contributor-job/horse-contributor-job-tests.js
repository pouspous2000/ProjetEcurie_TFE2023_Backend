import { describe, it, beforeEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'
import i18next from '../../../i18n'

import app from '@/app'
import db from '@/database'
import { HorseContributorJobFactory } from '@/modules/horse-contributor-job/factory'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/horse_contributor_jobs'

describe('HorseContributorJob Module', function () {
	/*
		- each test is independent of each other
		- assumes the table schema of the test database is up-to-date
		- truncate table before each test to prevent data inconsistency if a test crashes
		- when creation is needed => chose to interact with the model (>< service) to win some extra-time
		- we could have mocked up the "validation" tests BUT
			- the mock cannot reach any sql error
			- and has a minimal effect on test performance (time)
			- this choice could change if
				- the need arises to test the corresponding service
				- and/or test execution time becomes an issue
	 */
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

	it('delete', async function () {
		const veterinary = await db.models.HorseContributorJob.create(HorseContributorJobFactory.createVeterinary())

		const response = await chai.request(app).delete(`${routePrefix}/${veterinary.id}`)
		response.should.have.status(204)
	})

	it('create invalid - duplicate unique name', async function () {
		// we assume the error is the handled sql constraint error
		await db.models.HorseContributorJob.create(HorseContributorJobFactory.createVeterinary())
		const invalidDuplicateRecord = HorseContributorJobFactory.createVeterinary()
		const response = await chai.request(app).post(`${routePrefix}`).send(invalidDuplicateRecord)
		response.should.have.status(422)
	})

	it('create invalid - missing name', async function () {
		// note we could use a mockup package to prevent unnecessary http requests
		const invalidHorseContributorJob = {
			createdAt: new Date(),
			updatedAt: new Date(),
		}
		const response = await chai.request(app).post(`${routePrefix}`).send(invalidHorseContributorJob)
		const error = JSON.parse(response.error.text)
		error.should.have.property('message').eql(i18next.t('common_validation_error'))
		response.should.have.status(422)
	})

	it('update', async function () {
		const veterinary = await db.models.HorseContributorJob.create(HorseContributorJobFactory.createVeterinary())
		const response = await chai.request(app).put(`${routePrefix}/${veterinary.id}`).send({
			name: 'updatedName',
		})
		response.should.have.status(201)
		response.body.should.have.property('name').eql('UpdatedName')
		response.body.should.have.property('createdAt')
		response.body.should.have.property('updatedAt')
	})
})
