import { QueryTypes } from 'sequelize'
import { Horse } from '@/modules/horse/model'
import { HorseContributorJob } from '@/modules/horse-contributor-job/model'
import { HorseContributor } from '@/modules/horse-contributor/model'
import { HorseContributorHorseContributorJob } from '@/modules/horseContributor-horseContributorJob/model'

export const upHcHcj = async queryInterface => {
	const horses = await queryInterface.sequelize.query(`SELECT * FROM ${Horse.getTable()}`, {
		type: QueryTypes.SELECT,
	})
	const horseContributors = await queryInterface.sequelize.query(`SELECT * FROM ${HorseContributor.getTable()}`, {
		type: QueryTypes.SELECT,
	})
	const horseContributorJobs = await queryInterface.sequelize.query(
		`SELECT * FROM ${HorseContributorJob.getTable()}`,
		{ type: QueryTypes.SELECT }
	)

	const horseContributorJobIds = horseContributorJobs.map(hcj => hcj.id)
	const horseContributorIds = horseContributors.map(hc => hc.id)

	const hcHcjObjs = [] //horseContributorHorseContributorJobObjs
	horses.forEach(horse => {
		const shuffledHcjIds = horseContributorJobIds.sort(() => 0.5 - Math.random())
		const randomNbHcjElements = Math.floor(Math.random() * (horseContributorJobIds.length - 1))
		const randomHcjIds = shuffledHcjIds.slice(0, randomNbHcjElements)

		const shuffledHcIds = horseContributorIds.sort(() => 0.5 - Math.random())
		const randomNbHcElements = Math.floor(Math.random() * (horseContributorIds.length - 1))
		const randomHcIds = shuffledHcIds.slice(0, randomNbHcElements)

		for (let i = 0; i < randomHcjIds.length; i++) {
			for (let j = 0; j < randomHcIds.length; j++) {
				hcHcjObjs.push({
					horseId: horse.id,
					horseContributorId: randomHcIds[j],
					horseContributorJobId: randomHcjIds[i],
					createdAt: new Date(),
					updatedAt: new Date(),
				})
			}
		}
	})

	await queryInterface.bulkInsert(HorseContributorHorseContributorJob.getTable(), hcHcjObjs)
}

export const downHcHcj = async queryInterface => {
	await queryInterface.bulkDelete(HorseContributorHorseContributorJob.getTable(), null, { force: true })
}
