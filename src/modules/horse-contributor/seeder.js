import { Op } from 'sequelize'
import { HorseContributor } from '@/modules/horse-contributor/model'
import { HorseContributorFactory } from '@/modules/horse-contributor/factory'
import { HorseContributorJob } from '@/modules/horse-contributor-job/model'
import { HorseContributorHorseContributorJob } from '@/database/models/horseContributor-horseContributorJob'

export const upHorseContributor = async queryInterface => {
	await queryInterface.bulkInsert(HorseContributor.getTable(), HorseContributorFactory.bulkCreate(3))

	const hcs = await queryInterface.rawSelect(
		HorseContributor.getTable(),
		{
			where: {
				id: {
					[Op.ne]: 0,
				},
			},
			plain: false,
		},
		['id']
	)
	const hcIds = hcs.map(hc => hc.id)

	const hcjs = await queryInterface.rawSelect(
		HorseContributorJob.getTable(),
		{
			where: {
				id: {
					[Op.ne]: 0,
				},
			},
			plain: false,
		},
		['id']
	)

	const hcjIds = hcjs.map(hcj => hcj.id)

	for (let i = 0; i < hcIds.length; i++) {
		const shuffledHcjIds = hcjIds.sort(() => 0.5 - Math.random())
		const randomNbHcjElements = Math.random() * (hcjIds.length + 1)
		const randomHcjIds = shuffledHcjIds.slice(0, randomNbHcjElements)

		await queryInterface.bulkInsert(
			HorseContributorHorseContributorJob.getTable(),
			randomHcjIds.map(hcjId => {
				return {
					horseContributorId: hcIds[i],
					horseContributorJobId: hcjId,
					createdAt: new Date(),
					updatedAt: new Date(),
				}
			})
		)
	}
}

export const downHorseContributor = async queryInterface => {
	await queryInterface.bulkDelete(HorseContributor.getTable(), null, {})
}
