import { Model, DataTypes } from 'sequelize'
import { CacheUtils } from '@/utils/CacheUtils'

export class HorseContributorJob extends Model {
	static getTable() {
		return 'horse_contributor_jobs'
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
			modelName: 'HorseContributorJob',
			tableName: HorseContributorJob.getTable(),
		}
	)

	// define hooks here
	HorseContributorJob.addHook('afterFind', async records => {
		if (records === null) {
			return
		}
		if (!Array.isArray(records)) {
			records = [records] // beware it is not a pure method !
		}
		for (const record of records) {
			// notice we could Promise.all for extra perf
			const cacheKey = `HorseContributorJob_${record.id}`
			const cachedValue = await CacheUtils.get(cacheKey)
			if (!cachedValue) {
				await CacheUtils.set(cacheKey, record)
			}
		}
	})

	HorseContributorJob.addHook('afterDestroy', async record => {
		const cacheKey = `HorseContributorJob_${record.id}`
		await CacheUtils.del(cacheKey)
	})

	HorseContributorJob.addHook('afterCreate', async record => {
		const cacheKey = `HorseContributorJob_${record.id}`
		await CacheUtils.set(cacheKey, record)
	})

	HorseContributorJob.addHook('afterUpdate', async record => {
		const cacheKey = `HorseContributorJob_${record.id}`
		await CacheUtils.set(cacheKey, record)
	})

	return HorseContributorJob
}
