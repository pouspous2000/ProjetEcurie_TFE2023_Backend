import { Model, DataTypes } from 'sequelize'
import { ModelCacheHooksUtils } from '@/utils/CacheUtils'
import { StringUtils } from '@/utils/StringUtils'
import i18next from 'i18next'

export class Contact extends Model {
	static getTable() {
		return 'contacts'
	}

	static getModelName() {
		return 'Contact'
	}

	static associate(models) {
		Contact.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
	}
}

export default function (sequelize) {
	Contact.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: {
					isInt: {
						msg: i18next.t('contact_sql_validation_userId_isInt'),
					},
					min: {
						args: [1],
						msg: i18next.t('contact_sql_validation_userId_min'),
					},
				},
			},
			firstName: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: i18next.t('contact_sql_validation_firstname_notEmpty'),
					},
				},
				set(value) {
					this.setDataValue('firstName', StringUtils.capitalizeFirstLetter(value))
				},
			},
			lastName: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: i18next.t('contact_sql_validation_lastname_notEmpty'),
					},
				},
				set(value) {
					this.setDataValue('lastName', StringUtils.capitalizeFirstLetter(value))
				},
			},
			phone: {
				type: DataTypes.STRING,
				allowNull: true,
				set(value) {
					this.setDataValue('phone', StringUtils.removeAllWhiteSpaces(value))
				},
			},
			mobile: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: {
					msg: i18next.t('contact_sql_validation_mobile_unique'),
				},
				set(value) {
					this.setDataValue('mobile', StringUtils.removeAllWhiteSpaces(value))
				},
			},
			address: {
				type: DataTypes.TEXT,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: i18next.t('contact_sql_validation_address_notEmpty'),
					},
				},
			},
			invoicingAddress: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: Contact.getModelName(),
			tableName: Contact.getTable(),
		}
	)

	Contact.addHook('afterFind', async contacts => {
		await ModelCacheHooksUtils.afterFind(contacts, Contact.getModelName())
	})

	Contact.addHook('afterDestroy', async () => {
		await ModelCacheHooksUtils.clearModelCache(Contact.getModelName()) // [IMP] we could keep the cache and update it instead
	})

	Contact.addHook('afterCreate', async () => {
		await ModelCacheHooksUtils.clearModelCache(Contact.getModelName()) //[IMP] we could keep the cache and update it instead of clear
	})

	Contact.addHook('afterUpdate', async () => {
		await ModelCacheHooksUtils.clearModelCache(Contact.getModelName()) //[IMP] we could keep the cache and update it instead of clear
	})

	return Contact
}
