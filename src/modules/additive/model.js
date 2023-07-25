import { Model, DataTypes } from 'sequelize'
import { ModelCacheHooksUtils } from '@/utils/CacheUtils'
import { StringUtils } from '@/utils/StringUtils'
import i18next from 'i18next'

export class Additive extends Model {
	static getTable() {
		return 'additives'
	}

	static getModelName() {
		return 'Additive'
	}

	static associate(models) {
		Additive.belongsToMany(models.Horse, {
			through: models.AdditiveData,
			foreignKey: 'additiveId',
			otherKey: 'horseId',
			as: 'horses',
		})
	}
}

export default function (sequelize) {
	Additive.init(
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
					msg: i18next.t('additive_sql_validation_name_unique'),
				},
				validate: {
					notNull: {
						msg: i18next.t('additive_sql_validation_name_notNull'),
					},
				},
				set(value) {
					this.setDataValue('name', StringUtils.capitalizeFirstLetter(value.trim().toLowerCase()))
				},
			},
			price: {
				type: DataTypes.DECIMAL,
				allowNull: false,
				validate: {
					notNull: {
						msg: i18next.t('additive_sql_validation_price_notNull'),
					},
				},
			},
		},
		{
			sequelize,
			modelName: Additive.getModelName(),
			tableName: Additive.getTable(),
			paranoid: true,
		}
	)

	Additive.addHook('afterFind', async additives => {
		await ModelCacheHooksUtils.afterFind(additives, Additive.getModelName())
	})

	Additive.addHook('afterDestroy', async () => {
		await ModelCacheHooksUtils.clearModelCache(Additive.getModelName())
	})

	Additive.addHook('afterCreate', async () => {
		await ModelCacheHooksUtils.clearModelCache(Additive.getModelName())
	})

	Additive.addHook('afterUpdate', async () => {
		await ModelCacheHooksUtils.clearModelCache(Additive.getModelName())
	})

	return Additive
}
