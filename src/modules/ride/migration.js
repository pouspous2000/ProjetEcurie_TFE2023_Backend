import { Ride } from '@/modules/ride/model'
import { DataTypes } from 'sequelize'

export const upRide = async (queryInterface, Sequelize) =>
	queryInterface.createTable(Ride.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		price: {
			type: DataTypes.DECIMAL,
			allowNull: false,
		},
		period: {
			type: DataTypes.ENUM,
			allowNull: false,
			values: ['WORKINGDAYS', 'WEEKEND', 'WEEK', 'DAY'],
		},
		name: {
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
		deletedAt: {
			allowNull: true,
			type: Sequelize.DATE,
		},
	})

export const downRide = async queryInterface => queryInterface.dropTable(Ride.getTable())
