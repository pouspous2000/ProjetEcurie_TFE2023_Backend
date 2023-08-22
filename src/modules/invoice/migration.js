import { DataTypes } from 'sequelize'
import { Invoice } from '@/modules/invoice/model'
import { User } from '@/modules/authentication/model'
import { Horse } from '@/modules/horse/model'

export const upInvoice = async (queryInterface, Sequelize) =>
	queryInterface.createTable(Invoice.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
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
		horseId: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: Horse.getTable(),
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
		period: {
			type: DataTypes.DATE,
			allowNull: false,
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
