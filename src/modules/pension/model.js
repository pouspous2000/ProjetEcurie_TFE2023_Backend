import { Model, DataTypes } from 'sequelize'
import { ModelCacheHooksUtils } from '@/utils/CacheUtils'
import i18next from '../../../i18n'
import { StringUtils } from '@/utils/StringUtils'

export class Pension extends Model {
	static getTable() {
		return 'pensions'
	}

	static getModelName() {
		return 'Pension'
	}

	static associate(models) {
		Pension.hasMany(models.Horse, { foreignKey: 'pensionId', as: 'horses' })
		Pension.belongsToMany(models.Horse, {
			through: models.PensionData,
			foreignKey: 'pensionId',
			otherKey: 'horseId',
			as: 'horsePensionDatas',
		})
	}
}

export default function (sequelize) {
	Pension.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: {
					msg: i18next.t('pension_sql_validation_name_unique'),
				},
				validate: {
					notEmpty: {
						msg: i18next.t('pension_sql_validation_name_notEmpty'),
					},
				},
				set(value) {
					this.setDataValue('name', StringUtils.capitalizeFirstLetter(value.toLowerCase().trim()))
				},
			},
			monthlyPrice: {
				type: DataTypes.DECIMAL,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: i18next.t('pension_sql_validation_monthlyPrice_notEmpty'),
					},
					min: {
						args: [0.0],
						msg: i18next.t('pension_sql_validation_monthlyPrice_min'),
					},
				},
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: Pension.getModelName(),
			tableName: Pension.getTable(),
			paranoid: true,
		}
	)

	Pension.addHook('afterFind', async pensions => {
		await ModelCacheHooksUtils.afterFind(pensions, Pension.getModelName())
	})

	Pension.addHook('afterDestroy', async () => {
		await ModelCacheHooksUtils.clearModelCache(Pension.getModelName())
	})

	Pension.addHook('afterCreate', async () => {
		await ModelCacheHooksUtils.clearModelCache(Pension.getModelName())
	})

	Pension.addHook('afterUpdate', async () => {
		await ModelCacheHooksUtils.clearModelCache(Pension.getModelName())
	})

	return Pension
}
