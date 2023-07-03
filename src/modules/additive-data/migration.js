import { DataTypes } from 'sequelize'
import { AdditiveHorse } from '@/modules/additive-data/model'
import { Additive } from '@/modules/additive/model'
import { Horse } from '@/modules/horse/model'

export const upAdditiveHorse = (queryInterface, Sequelize) =>
	queryInterface.createTable(AdditiveHorse.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		additiveId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Additive.getTable(),
				field: 'id',
			},
			onDelete: 'NO ACTION',
			onUpdate: 'NO ACTION',
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
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		price: {
			type: DataTypes.DECIMAL,
			allowNull: false,
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

export const downAdditiveHorse = queryInterface => queryInterface.dropTable(AdditiveHorse.getTable())
