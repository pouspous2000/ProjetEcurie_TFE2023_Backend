import { Model, DataTypes } from 'sequelize'
import { StringUtils } from '@/utils/StringUtils'
import i18next from '../../../i18n'

export class Ride extends Model {
	static getTable() {
		return 'rides'
	}

	static getModelName() {
		return 'Ride'
	}

	static associate(models) {
		Ride.belongsToMany(models.Horse, {
			through: models.HorseRide,
			foreignKey: 'rideId',
			otherKey: 'horseId',
			as: 'horses',
		})
	}
}

export default function (sequelize) {
	Ride.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			price: {
				type: DataTypes.DECIMAL,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: i18next.t('ride_sql_validation_price_notEmpty'),
					},
					min: {
						args: [0.0],
						msg: i18next.t('ride_sql_validation_price_min'),
					},
				},
			},
			period: {
				type: DataTypes.ENUM,
				allowNull: false,
				values: ['WORKINGDAYS', 'WEEKEND', 'WEEK', 'DAY'],
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: {
					msg: i18next.t('ride_sql_validation_name_unique'),
				},
				validate: {
					notEmpty: {
						msg: i18next.t('ride_sql_validation_name_notEmpty'),
					},
				},
				set(value) {
					this.setDataValue('name', StringUtils.capitalizeFirstLetter(value.toLowerCase().trim()))
				},
			},
		},
		{
			sequelize,
			modelName: Ride.getModelName(),
			tableName: Ride.getTable(),
			paranoid: true,
		}
	)

	return Ride
}
