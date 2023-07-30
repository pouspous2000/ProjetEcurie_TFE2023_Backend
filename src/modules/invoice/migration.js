import { DataTypes } from 'sequelize'
import { Invoice } from '@/modules/invoice/model'
import { User } from '@/modules/authentication/model'
import { Stable } from '@/modules/stable/model'

export const upInvoice = async (queryInterface, Sequelize) =>
	queryInterface.createTable(Invoice.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		stableId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Stable.getTable(),
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		},
		clientId: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: User.getTable(),
				field: 'id',
			},
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
		},
		bucket: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		key: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		number: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		price: {
			type: DataTypes.DECIMAL,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM,
			allowNull: false,
			values: ['UNPAID', 'PAID'],
		},
		dueDateAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		paidAt: {
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
	})

export const downInvoice = async queryInterface => queryInterface.dropTable(Invoice.getTable())
