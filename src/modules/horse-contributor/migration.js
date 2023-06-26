import { HorseContributor } from '@/modules/horse-contributor/model'
import { DataTypes } from 'sequelize'

export const upHorseContributor = async (queryInterface, Sequelize) =>
	queryInterface.createTable(HorseContributor.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		firstName: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
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

export const downHorseContributor = async queryInterface => queryInterface.dropTable(HorseContributor.getTable())
