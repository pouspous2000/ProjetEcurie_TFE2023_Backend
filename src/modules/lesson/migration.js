import { DataTypes } from 'sequelize'
import { Lesson } from '@/modules/lesson/model'
import { User } from '@/modules/authentication/model'

export const upLesson = async (queryInterface, Sequelize) =>
	queryInterface.createTable(Lesson.getTable(), {
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
		clientId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: User.getTable(),
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		},
		startingAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		endingAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM,
			allowNull: false,
			values: ['CONFIRMED', 'DONE', 'CANCELLED', 'ABSENCE'],
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

export const downLesson = async queryInterface => queryInterface.dropTable(Lesson.getTable())
