import { DataTypes, Model } from 'sequelize'

export class DailyRide extends Model {
	static getTable() {
		return 'daily_rides'
	}

	static getModelName() {
		return 'DailyRide'
	}

	static associate(models) {
		DailyRide.belongsTo(models.Horse, { foreignKey: 'horseId', as: 'horse' })
		DailyRide.belongsTo(models.Ride, { foreignKey: 'rideId', as: 'ride' })
		DailyRide.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' })
	}
}

export default function (sequelize) {
	DailyRide.init(
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
			taskId: {
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
				values: ['DAY'],
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
			modelName: DailyRide.getModelName(),
			tableName: DailyRide.getTable(),
			timestamps: true,
			updatedAt: false,
		}
	)

	return DailyRide
}
