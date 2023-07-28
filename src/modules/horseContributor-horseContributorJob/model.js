import { DataTypes, Model } from 'sequelize'

export class HorseContributorHorseContributorJob extends Model {
	static getTable() {
		return 'horseContributor_horseContributorJobs'
	}

	static getModelName() {
		return 'HorseContributorHorseContributorJob'
	}

	static associate(models) {
		HorseContributorHorseContributorJob.belongsTo(models.Horse, { foreignKey: 'horseId' })
		HorseContributorHorseContributorJob.belongsTo(models.HorseContributor, {
			foreignKey: 'horseContributorId',
			as: 'horseContributor',
		})
		HorseContributorHorseContributorJob.belongsTo(models.HorseContributorJob, {
			foreignKey: 'horseContributorJobId',
			as: 'horseContributorJob',
		})
	}
}

export default function (sequelize) {
	HorseContributorHorseContributorJob.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			horseId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			horseContributorId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			horseContributorJobId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: HorseContributorHorseContributorJob.getModelName(),
			tableName: HorseContributorHorseContributorJob.getTable(),
		}
	)

	return HorseContributorHorseContributorJob
}
