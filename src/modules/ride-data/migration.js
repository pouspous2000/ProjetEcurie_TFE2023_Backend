import { DataTypes } from 'sequelize'
import { HorseRide } from '@/modules/ride-data/model'
import { Horse } from '@/modules/horse/model'
import { Ride } from '@/modules/ride/model'

export const upHorseRide = (queryInterface, Sequelize) =>
	queryInterface.createTable(HorseRide.getTable(), {
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
		startingAt: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		endingAt: {
			type: DataTypes.DATE,
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
		deletedAt: {
			allowNull: true,
			type: Sequelize.DATE,
		},
	})

export const downHorseRide = queryInterface => queryInterface.dropTable(HorseRide.getTable())
