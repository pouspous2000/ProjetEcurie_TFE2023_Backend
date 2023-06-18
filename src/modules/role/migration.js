import { Role } from '@/modules/role/model'
import { DataTypes } from 'sequelize'

export const upRole = async (queryInterface, Sequelize) =>
	queryInterface.createTable(Role.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		parentId: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: Role.getTable(),
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
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
	})

export const downRole = async queryInterface => queryInterface.dropTable(Role.getTable())
