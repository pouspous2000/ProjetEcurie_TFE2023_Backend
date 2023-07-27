import { HorseContributorJob } from '@/modules/horse-contributor-job/model'
import { HorseContributorJobFactory } from '@/modules/horse-contributor-job/factory'

export const upHorseContributorJob = async queryInterface => {
	const horseContributorJobs = []
	for (let i = 0; i < 10; i++) {
		horseContributorJobs.push(HorseContributorJobFactory.create())
	}
	horseContributorJobs.push(HorseContributorJobFactory.createVeterinary())
	await queryInterface.bulkInsert(HorseContributorJob.getTable(), horseContributorJobs)
}

export const downHorseContributorJob = async queryInterface => {
	await queryInterface.bulkDelete(HorseContributorJob.getTable(), null, { force: true })
}
