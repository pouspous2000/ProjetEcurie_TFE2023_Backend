import { DataTypes } from 'sequelize'
import { Event } from '@/modules/event/model'
import { User } from '@/modules/authentication/model'
import { EventUser } from '@/database/models/event-user'

export const up = async (queryInterface, Sequelize) =>
	queryInterface.createTable(EventUser.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: User.getTable(),
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		},
		eventId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Event.getTable(),
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

export const down = async queryInterface => queryInterface.dropTable(EventUser.getTable())
