import { HorseContributorJob } from '@/modules/horse-contributor-job/model'

export const upHorseContributorJob = async (queryInterface, Sequelize) =>
	queryInterface.createTable(HorseContributorJob.getTable(), {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
		createdAt: {
			allowNull: false,
			type: Sequelize.DATE,
		},
		updatedAt: {
			allowNull: false,
			type: Sequelize.DATE,
		},
	})

export const downHorseContributorJob = async queryInterface => queryInterface.dropTable(HorseContributorJob.getTable())
