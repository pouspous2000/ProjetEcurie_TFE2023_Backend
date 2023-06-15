import { Model, DataTypes } from 'sequelize'
import { ModelCacheHooksUtils } from '@/utils/CacheUtils'

export class HorseContributorJob extends Model {
	static getTable() {
		return 'horse_contributor_jobs'
	}

	static getModelName() {
		return 'HorseContributorJob'
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
				unique: true,
				set(value) {
					this.setDataValue('name', value.charAt(0).toUpperCase() + value.slice(1))
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
