import { DataTypes } from 'sequelize'
import { PensionData } from '@/modules/pensionData/model'
import { Pension } from '@/modules/pension/model'
import { Horse } from '@/modules/horse/model'

export const upPensionData = (queryInterface, Sequelize) =>
	queryInterface.createTable(PensionData.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		horseId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Horse.getTable(),
				field: 'id',
			},
			onDelete: 'NO ACTION',
			onUpdate: 'NO ACTION',
		},
		pensionId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Pension.getTable(),
				field: 'id',
			},
			onDelete: 'NO ACTION',
			onUpdate: 'NO ACTION',
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		monthlyPrice: {
			type: DataTypes.DECIMAL,
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		createdAt: {
			type: Sequelize.DATE,
			allowNull: false,
		},
		deletedAt: {
			type: Sequelize.DATE,
			allowNull: true,
		},
	})

export const downPensionData = queryInterface => queryInterface.dropTable(PensionData.getTable())
