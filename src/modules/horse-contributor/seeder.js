import { QueryTypes } from 'sequelize'
import { HorseContributor } from '@/modules/horse-contributor/model'
import { HorseContributorFactory } from '@/modules/horse-contributor/factory'
import { HorseContributorJob } from '@/modules/horse-contributor-job/model'
import { HorseContributorHorseContributorJob } from '@/database/models/horseContributor-horseContributorJob'

export const upHorseContributor = async queryInterface => {
	// hc = horseContributor, hcj = horseContributorJob
	const hcs = await queryInterface.bulkInsert(HorseContributor.getTable(), HorseContributorFactory.bulkCreate(3), {
		returning: ['id'],
	})
	const hcIds = hcs.map(hcId => hcId.id)

	const hcjs = await queryInterface.sequelize.query(`SELECT * FROM ${HorseContributorJob.getTable()}`, {
		type: QueryTypes.SELECT,
	})
	const hcjIds = hcjs.map(hcj => hcj.id)

	const horseContributorJojObjs = []

	for (let i = 0; i < hcIds.length; i++) {
		const shuffledHcjIds = hcjIds.sort(() => 0.5 - Math.random())
		const randomNbHcjElements = Math.floor(Math.random() * (hcjIds.length - 1))
		const randomHcjIds = shuffledHcjIds.slice(0, randomNbHcjElements)

		horseContributorJojObjs.push(
			...randomHcjIds.map(hcjId => {
				return {
					horseContributorId: hcIds[i],
					horseContributorJobId: hcjId,
					createdAt: new Date(),
					updatedAt: new Date(),
				}
			})
		)
	}
	await queryInterface.bulkInsert(HorseContributorHorseContributorJob.getTable(), horseContributorJojObjs)
}

export const downHorseContributor = async queryInterface => {
	await queryInterface.bulkDelete(HorseContributor.getTable(), null, { force: true })
}
