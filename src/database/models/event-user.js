import { DataTypes, Model } from 'sequelize'

export class EventUser extends Model {
	static getTable() {
		return 'event_users'
	}

	static getModelName() {
		return 'EventUser'
	}

	static associate(models) {
		EventUser.belongsTo(models.Event, { foreignKey: 'eventId' })
		EventUser.belongsTo(models.User, { foreignKey: 'userId' })
	}
}

export default function (sequelize) {
	EventUser.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			eventId: {
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
			modelName: EventUser.getModelName(),
			tableName: EventUser.getTable(),
		}
	)

	return EventUser
}
