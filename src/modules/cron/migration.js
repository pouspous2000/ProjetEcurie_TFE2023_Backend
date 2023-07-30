import { DataTypes } from 'sequelize'
import { Cron } from '@/modules/cron/model'
import { Invoice } from '@/modules/invoice/model'

export const upCron = (queryInterface, Sequelize) =>
	queryInterface.createTable(Cron.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		invoiceId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Invoice.getTable(),
				field: 'id',
			},
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		step: {
			type: DataTypes.ENUM,
			allowNull: false,
			values: ['PRE_PDF', 'PDF', 'PDF_SENT'],
		},
		status: {
			type: DataTypes.ENUM,
			allowNull: false,
			values: ['DONE', 'FAILED'],
		},
		createdAt: {
			type: Sequelize.DATE,
			allowNull: false,
		},
		updatedAt: {
			type: Sequelize.DATE,
			allowNull: false,
		},
	})

export const downCron = queryInterface => queryInterface.dropTable(Cron.getTable())
