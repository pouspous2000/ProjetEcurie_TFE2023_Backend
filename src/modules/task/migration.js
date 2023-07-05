import { DataTypes } from 'sequelize'
import { Task } from '@/modules/task/model'
import { User } from '@/modules/authentication/model'

export const upTask = async (queryInterface, Sequelize) =>
	queryInterface.createTable(Task.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		creatorId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: User.getTable(),
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		},
		employeeId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: User.getTable(),
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		startingAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		endingAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		remark: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		status: {
			type: DataTypes.ENUM,
			allowNull: false,
			values: ['PENDING', 'CONFIRMED', 'IN PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED'],
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

export const downTask = async queryInterface => queryInterface.dropTable(Task.getTable())
