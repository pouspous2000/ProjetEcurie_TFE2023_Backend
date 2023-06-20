import { User } from '@/modules/authentication/model'
import { DataTypes } from 'sequelize'

export const upUser = async (queryInterface, Sequelize) =>
	queryInterface.createTable(User.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM,
			values: ['ACTIVE', 'PENDING'],
			allowNull: true,
			defaultValue: 'PENDING',
		},
		confirmationCode: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
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

export const downUser = async queryInterface => queryInterface.dropTable(User.getTable())
