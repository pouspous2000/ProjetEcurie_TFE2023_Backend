import { DataTypes, Model } from 'sequelize'
import i18next from '../../../i18n'

export class HorseRide extends Model {
	static getTable() {
		return 'horse_rides'
	}

	static getModelName() {
		return 'HorseRide'
	}

	static associate(models) {
		HorseRide.belongsTo(models.Horse, { foreignKey: 'horseId' })
		HorseRide.belongsTo(models.Ride, { foreignKey: 'rideId' })
	}
}

export default function (sequelize) {
	HorseRide.init(
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
			rideId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			period: {
				type: DataTypes.ENUM,
				allowNull: false,
				values: ['WORKINGDAYS', 'WEEKEND', 'WEEK', 'DAY'],
			},
			price: {
				type: DataTypes.DECIMAL,
				allowNull: false,
			},
			startingAt: {
				type: DataTypes.DATE,
				allowNull: true,
				validate: {
					isAfterNow(value) {
						if (value && value < new Date()) {
							throw new Error(i18next.t('rideData_sql_validation_startingAt_isAfterNow'))
						}
					},
				},
			},
			endingAt: {
				type: DataTypes.DATE,
				allowNull: true,
				validate: {
					isAfterStartingAt(value) {
						if (value && value < this.startingAt) {
							throw new Error(i18next.t('rideData_sql_validation_endingAt_isAfterStartingAt'))
						}
					},
				},
			},
			deletedAt: {
				type: DataTypes.DATE,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: HorseRide.getModelName(),
			tableName: HorseRide.getTable(),
			timestamps: true,
			updatedAt: false,
		}
	)

	return HorseRide
}
