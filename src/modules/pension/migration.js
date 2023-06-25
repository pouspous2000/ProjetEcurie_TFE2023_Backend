import { Pension } from '@/modules/pension/model'
import { DataTypes } from 'sequelize'

export const upPension = async (queryInterface, Sequelize) =>
	queryInterface.createTable(Pension.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		monthlyPrice: {
			type: DataTypes.DECIMAL,
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
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

export const downPension = async queryInterface => queryInterface.dropTable(Pension.getTable())
