import { DataTypes } from 'sequelize'
import { Competition } from '@/modules/competition/model'
import { User } from '@/modules/authentication/model'

export const upCompetition = async (queryInterface, Sequelize) =>
	queryInterface.createTable(Competition.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		creatorId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: User.getTable(),
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		startingAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		endingAt: {
			type: DataTypes.DATE,
			allowNull: false,
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

export const downCompetition = async queryInterface => queryInterface.dropTable(Competition.getTable())
