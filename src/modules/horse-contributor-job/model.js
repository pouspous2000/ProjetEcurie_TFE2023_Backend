import { Model, DataTypes } from 'sequelize'
import { ModelCacheHooksUtils } from '@/utils/CacheUtils'
import { StringUtils } from '@/utils/StringUtils'
import i18next from '../../../i18n'

export class HorseContributorJob extends Model {
	static getTable() {
		return 'horse_contributor_jobs'
	}

	static getModelName() {
		return 'HorseContributorJob'
	}

	static associate(models) {
		HorseContributorJob.belongsToMany(models.HorseContributor, {
			through: models.HorseContributorHorseContributorJob,
			foreignKey: 'horseContributorJobId',
			otherKey: 'horseContributorId',
		})
	}
}

export default function (sequelize) {
	HorseContributorJob.init(
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
					msg: i18next.t('horseContributorJob_sql_validation_name_unique'),
				},
				set(value) {
					this.setDataValue('name', StringUtils.capitalizeFirstLetter(value.toLowerCase()))
				},
			},
		},
		{
			sequelize,
			modelName: HorseContributorJob.getModelName(),
			tableName: HorseContributorJob.getTable(),
		}
	)

	// define hooks here
	HorseContributorJob.addHook('afterFind', async records => {
		await ModelCacheHooksUtils.afterFind(records, HorseContributorJob.getModelName())
	})

	HorseContributorJob.addHook('afterDestroy', async record => {
		await ModelCacheHooksUtils.afterDestroy(record, HorseContributorJob.getModelName())
	})

	HorseContributorJob.addHook('afterCreate', async record => {
		await ModelCacheHooksUtils.afterCreate(record, HorseContributorJob.getModelName())
	})

	HorseContributorJob.addHook('afterUpdate', async record => {
		await ModelCacheHooksUtils.afterUpdate(record, HorseContributorJob.getModelName())
	})

	return HorseContributorJob
}
