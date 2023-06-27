import { Additive } from '@/modules/additive/model'
import { DataTypes } from 'sequelize'

export const upAdditive = async (queryInterface, Sequelize) =>
	queryInterface.createTable(Additive.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
		},
		price: {
			type: DataTypes.DECIMAL,
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

export const downAdditive = async queryInterface => queryInterface.dropTable(Additive.getTable())
