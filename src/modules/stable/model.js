import { Model, DataTypes } from 'sequelize'
import i18next from '../../../i18n'
import { ModelCacheHooksUtils } from '@/utils/CacheUtils'
import { StringUtils } from '@/utils/StringUtils'

export class Stable extends Model {
	static getTable() {
		return 'stables'
	}

	static getModelName() {
		return 'Stable'
	}
}

export default function (sequelize) {
	Stable.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: i18next.t(''),
					},
				},
			},
			vat: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: {
					msg: i18next.t('stable_sql_validation_vat_unique'),
				},
				validate: {
					isBelgianVAT(value) {
						if (!new RegExp('^BE0[0-9]{9}').test(value)) {
							throw new Error(i18next.t('stable_sql_validation_vat_format'))
						}
					},
				},
				set(value) {
					this.setDataValue('vat', StringUtils.removeAllWhiteSpaces(value))
				},
			},
			address: {
				type: DataTypes.TEXT,
				allowNull: false,
				set(value) {
					this.setDataValue('address', value ? value.trim() : value)
				},
			},
			iban: {
				type: DataTypes.STRING,
				allowNull: false,
				isValidBelgianIban(value) {
					if (!new RegExp('^(BE\\d{2})(\\d{12})$').test(value)) {
						throw new Error(i18next.t('stable_sql_validation_iban_format'))
					}
				},
				set(value) {
					this.setDataValue('iban', value ? value.trim() : value)
				},
			},
			phone: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: {
					msg: i18next.t('stable_sql_validation_phone_unique'),
				},
				set(value) {
					this.setDataValue('phone', StringUtils.removeAllWhiteSpaces(value)) // remove all whitespaces
				},
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: {
					msg: i18next.t('stable_sql_validation_email_unique'),
				},
				validate: {
					isEmail: {
						msg: i18next.t('stable_sql_validation_email_email'),
					},
				},
				set(value) {
					this.setDataValue('email', StringUtils.removeAllWhiteSpaces(value.toLowerCase()))
				},
			},
			invoicePrefix: {
				type: DataTypes.STRING,
				allowNull: true,
				default: '',
			},
		},
		{
			sequelize,
			modelName: Stable.getModelName(),
			tableName: Stable.getTable(),
		}
	)

	// hooks
	Stable.addHook('afterFind', async records => {
		await ModelCacheHooksUtils.afterFind(records, Stable.getModelName())
	})

	Stable.addHook('afterDestroy', async record => {
		await ModelCacheHooksUtils.afterDestroy(record, Stable.getModelName())
	})

	Stable.addHook('afterCreate', async record => {
		await ModelCacheHooksUtils.afterCreate(record, Stable.getModelName())
	})

	Stable.addHook('afterUpdate', async record => {
		await ModelCacheHooksUtils.afterUpdate(record, Stable.getModelName())
	})
}
