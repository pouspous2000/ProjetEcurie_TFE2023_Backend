import { Model, DataTypes } from 'sequelize'

export class CompetitionUser extends Model {
	static getTable() {
		return 'competition_users'
	}

	static getModelName() {
		return 'CompetitionUser'
	}

	static associate(models) {
		CompetitionUser.belongsTo(models.Competition, { foreignKey: 'competitionId' })
		CompetitionUser.belongsTo(models.User, { foreignKey: 'userId' })
	}
}

export default function (sequelize) {
	CompetitionUser.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			competitionId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: CompetitionUser.getModelName(),
			tableName: CompetitionUser.getTable(),
		}
	)
}
