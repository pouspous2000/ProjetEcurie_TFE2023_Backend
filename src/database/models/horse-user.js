import { DataTypes, Model } from 'sequelize'

export class HorseUser extends Model {
	static getTable() {
		return 'horse_users'
	}

	static getModelName() {
		return 'HorseUser'
	}

	static associate(models) {
		HorseUser.belongsTo(models.User, { foreignKey: 'userId' })
		HorseUser.belongsTo(models.Horse, { foreignKey: 'horseId' })
	}
}

export default function (sequelize) {
	HorseUser.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			horseId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: HorseUser.getModelName(),
			tableName: HorseUser.getTable(),
		}
	)

	return HorseUser
}
