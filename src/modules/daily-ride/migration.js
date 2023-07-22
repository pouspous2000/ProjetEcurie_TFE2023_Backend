import { DataTypes } from 'sequelize'
import { Task } from '@/modules/task/model'
import { Ride } from '@/modules/ride/model'
import { Horse } from '@/modules/horse/model'
import { DailyRide } from '@/modules/daily-ride/model'

export const upDailyRide = (queryInterface, Sequelize) =>
	queryInterface.createTable(DailyRide.getTable(), {
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
		taskId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Task.getTable(),
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
			values: ['DAY'],
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

export const downDailyRide = queryInterface => queryInterface.dropTable(DailyRide.getTable())
