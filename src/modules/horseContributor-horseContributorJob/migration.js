import { DataTypes } from 'sequelize'
import { HorseContributorHorseContributorJob } from '@/modules/horseContributor-horseContributorJob/model'
import { HorseContributorJob } from '@/modules/horse-contributor-job/model'
import { HorseContributor } from '@/modules/horse-contributor/model'
import { Horse } from '@/modules/horse/model'

export const upHcHcj = async (queryInterface, Sequelize) =>
	queryInterface.createTable(HorseContributorHorseContributorJob.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		horseId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Horse.getTable(),
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
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

export const downHcHcj = async queryInterface =>
	queryInterface.dropTable(HorseContributorHorseContributorJob.getTable())
