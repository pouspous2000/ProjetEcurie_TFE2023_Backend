import { DataTypes } from 'sequelize'
import { HorseContributorHorseContributorJob } from '@/database/models/horseContributor-horseContributorJob'
import { HorseContributorJob } from '@/modules/horse-contributor-job/model'
import { HorseContributor } from '@/modules/horse-contributor/model'

export const up = async (queryInterface, Sequelize) =>
	queryInterface.createTable(HorseContributorHorseContributorJob.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		horseContributorId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: HorseContributor.getTable(),
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		},
		horseContributorJobId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: HorseContributorJob.getTable(),
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
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

export const down = async queryInterface => queryInterface.dropTable(HorseContributorHorseContributorJob.getTable())
