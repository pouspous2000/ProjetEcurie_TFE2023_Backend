import { Model, DataTypes } from 'sequelize'

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
	return HorseContributorJob
}
