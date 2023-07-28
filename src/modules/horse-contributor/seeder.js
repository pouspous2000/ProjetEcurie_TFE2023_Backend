import { HorseContributor } from '@/modules/horse-contributor/model'
import { HorseContributorFactory } from '@/modules/horse-contributor/factory'

export const upHorseContributor = async queryInterface => {
	await queryInterface.bulkInsert(HorseContributor.getTable(), HorseContributorFactory.bulkCreate(3))
}

export const downHorseContributor = async queryInterface => {
	await queryInterface.bulkDelete(HorseContributor.getTable(), null, { force: true })
}
