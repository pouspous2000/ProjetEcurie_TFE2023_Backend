import { DataTypes } from 'sequelize'
import { AdditiveData } from '@/modules/additive-data/model'
import { Additive } from '@/modules/additive/model'
import { Horse } from '@/modules/horse/model'

export const upAdditiveData = (queryInterface, Sequelize) =>
	queryInterface.createTable(AdditiveData.getTable(), {
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
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		price: {
			type: DataTypes.DECIMAL,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM,
			allowNull: false,
			values: ['ACTIVE', 'CANCELLED', 'INVOICED'],
		},
		createdAt: {
			type: Sequelize.DATE,
			allowNull: false,
		},
	})

export const downAdditiveData = queryInterface => queryInterface.dropTable(AdditiveData.getTable())
