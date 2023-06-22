import { Contact } from '@/modules/contact/model'
import { DataTypes } from 'sequelize'
import { User } from '@/modules/authentication/model'
import i18next from '../../../i18n'

export const upContact = async (queryInterface, Sequelize) =>
	queryInterface.createTable(Contact.getTable(), {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: User.getTable(),
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		},
		firstName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		phone: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		mobile: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: {
				msg: i18next.t('contact_sql_validation_mobile_unique'),
			},
		},
		address: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		invoicingAddress: {
			type: DataTypes.TEXT,
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

export const downContact = async queryInterface => queryInterface.dropTable(Contact.getTable())
