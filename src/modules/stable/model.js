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
					notEmpty: true,
				},
			},
			vat: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
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
			phone: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				set(value) {
					this.setDataValue('phone', StringUtils.removeAllWhiteSpaces(value)) // remove all whitespaces
				},
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					isEmail: true,
				},
				set(value) {
					this.setDataValue('email', StringUtils.removeAllWhiteSpaces(value.toLowerCase()))
				},
			},
			invoiceNb: {
				type: DataTypes.INTEGER,
				allowNull: true,
				default: 1,
				validate: {
					isInt: true,
					min: 1,
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
