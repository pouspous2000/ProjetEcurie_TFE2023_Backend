import { DataTypes } from 'sequelize'
import { Horse } from '@/modules/horse/model'
import { User } from '@/modules/authentication/model'
import { Pension } from '@/modules/pension/model'
import { Ride } from '@/modules/ride/model'

export const upHorse = async (queryInterface, Sequelize) =>
	queryInterface.createTable(Horse.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		ownerId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: User.getTable(),
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		},
		pensionId: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: Pension.getTable(),
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		},
		rideId: {
			type: DataTypes.INTEGER,
			allowNull: true,
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
		comment: {
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

export const downHorse = async queryInterface => queryInterface.dropTable(Horse.getTable())
