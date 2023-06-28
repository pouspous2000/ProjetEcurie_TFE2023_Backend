import { DataTypes } from 'sequelize'
import { HorseUser } from '@/database/models/horse-user'
import { Horse } from '@/modules/horse/model'
import { User } from '@/modules/authentication/model'

export const up = async (queryInterface, Sequelize) =>
	queryInterface.createTable(HorseUser.getTable(), {
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
		createdAt: {
			allowNull: false,
			type: Sequelize.DATE,
		},
		updatedAt: {
			allowNull: false,
			type: Sequelize.DATE,
		},
	})

export const down = async queryInterface => queryInterface.dropTable(HorseUser.getTable())
