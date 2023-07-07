import { Model, DataTypes } from 'sequelize'
import { StringUtils } from '@/utils/StringUtils'
import i18next from '../../../i18n'

export class Event extends Model {
	static getTable() {
		return 'events'
	}

	static getModelName() {
		return 'Event'
	}

	static associate(models) {
		Event.belongsTo(models.User, { foreignKey: 'creatorId', as: 'creator' })
	}
}

export default function (sequelize) {
	Event.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			creatorId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: {
					isInt: {
						msg: i18next.t('event_sql_validation_creatorId_isInt'),
					},
					min: {
						args: [1],
						msg: i18next.t('event_sql_validation_creatorId_min'),
					},
				},
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: i18next.t('event_sql_validation_name_notEmpty'),
					},
				},
				set(value) {
					this.setDataValue('name', StringUtils.capitalizeFirstLetter(value.toLowerCase().trim()))
				},
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: i18next.t('event_sql_validation_description_notEmpty'),
					},
				},
				set(value) {
					this.setDataValue('description', (value = value ? value.trim() : value))
				},
			},
			startingAt: {
				type: DataTypes.DATE,
				allowNull: false,
				validate: {
					isAfterNow(value) {
						if (value < new Date()) {
							throw new Error(i18next.t('event_sql_validation_startingAt_isAfterNow'))
						}
					},
				},
			},
			endingAt: {
				type: DataTypes.DATE,
				allowNull: false,
				validate: {
					isAfterStartingAt(value) {
						if (value < this.startingAt) {
							throw new Error(i18next.t('event_sql_validation_endingAt_isAfterStartingAt'))
						}
					},
				},
			},
		},
		{
			sequelize,
			modelName: Event.getModelName(),
			tableName: Event.getTable(),
		}
	)
	return Event
}
