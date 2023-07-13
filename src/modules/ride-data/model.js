import { DataTypes, Model } from 'sequelize'

export class RideData extends Model {
	static getTable() {
		return 'ride_datas'
	}

	static getModelName() {
		return 'RideData'
	}

	static associate(models) {
		RideData.belongsTo(models.Horse, { foreignKey: 'horseId' })
		RideData.belongsTo(models.Ride, { foreignKey: 'rideId' })
	}
}

export default function (sequelize) {
	RideData.init(
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
			deletedAt: {
				type: DataTypes.DATE,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: RideData.getModelName(),
			tableName: RideData.getTable(),
			timestamps: true,
			updatedAt: false,
		}
	)

	return RideData
}
