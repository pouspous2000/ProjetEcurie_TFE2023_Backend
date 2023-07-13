import { DataTypes } from 'sequelize'
import { RideData } from '@/modules/ride-data/model'
import { Horse } from '@/modules/horse/model'
import { Ride } from '@/modules/ride/model'

export const upRideData = (queryInterface, Sequelize) =>
	queryInterface.createTable(RideData.getTable(), {
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
		rideId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Ride.getTable(),
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		period: {
			type: DataTypes.ENUM,
			allowNull: false,
			values: ['WORKINGDAYS', 'WEEKEND', 'WEEK', 'DAY'],
		},
		price: {
			type: DataTypes.DECIMAL,
			allowNull: false,
		},
		createdAt: {
			allowNull: false,
			type: Sequelize.DATE,
		},
		deletedAt: {
			allowNull: true,
			type: Sequelize.DATE,
		},
	})

export const downRideData = queryInterface => queryInterface.dropTable(RideData.getTable())
