import { Model, DataTypes } from 'sequelize'
import { ModelCacheHooksUtils } from '@/utils/CacheUtils'
import { StringUtils } from '@/utils/StringUtils'
import i18next from '../../../i18n'

export class HorseContributor extends Model {
	static getTable() {
		return 'horse_contributors'
	}

	static getModelName() {
		return 'HorseContributor'
	}

	static associate(models) {
		HorseContributor.belongsToMany(models.HorseContributorJob, {
			through: models.HorseContributorHorseContributorJob,
			foreignKey: 'horseContributorId',
			otherKey: 'horseContributorJobId',
			as: 'horseContributorJobs',
		})
	}
}

export default function (sequelize) {
	HorseContributor.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			firstName: {
				type: DataTypes.STRING,
				allowNull: true,
				set(value) {
					this.setDataValue('firstName', StringUtils.capitalizeFirstLetter(value.trim()))
				},
			},
			lastName: {
				type: DataTypes.STRING,
				allowNull: false,
				set(value) {
					this.setDataValue('lastName', StringUtils.capitalizeFirstLetter(value.trim()))
				},
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: {
					msg: i18next.t('horseContributor_sql_validation_email_unique'),
				},
				validate: {
					isEmail: {
						msg: i18next.t('horseContributor_sql_validation_email_isEmail'),
					},
				},
			},
		},
		{
			sequelize,
			modelName: HorseContributor.getModelName(),
			tableName: HorseContributor.getTable(),
		}
	)

	HorseContributor.addHook('afterFind', async horseContributors => {
		await ModelCacheHooksUtils.afterFind(horseContributors, HorseContributor.getModelName())
	})

	HorseContributor.addHook('afterDestroy', async () => {
		await ModelCacheHooksUtils.clearModelCache(HorseContributor.getModelName())
	})

	HorseContributor.addHook('afterCreate', async () => {
		await ModelCacheHooksUtils.clearModelCache(HorseContributor.getModelName())
	})

	HorseContributor.addHook('afterUpdate', async () => {
		await ModelCacheHooksUtils.clearModelCache(HorseContributor.getModelName())
	})

	return HorseContributor
}
