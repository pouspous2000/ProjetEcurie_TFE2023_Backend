import { Model, DataTypes } from 'sequelize'
import i18next from '../../../i18n'

export class Lesson extends Model {
	static getTable() {
		return 'lessons'
	}

	static getModelName() {
		return 'Lesson'
	}

	static associate(models) {
		Lesson.belongsTo(models.User, { foreignKey: 'creatorId', as: 'creator' })
		Lesson.belongsTo(models.User, { foreignKey: 'clientId', as: 'client' })
	}
}

export default function (sequelize) {
	Lesson.init(
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
						msg: i18next.t('lesson_sql_validation_creatorId_isInt'),
					},
					min: {
						args: [1],
						msg: i18next.t('lesson_sql_validation_creatorId_min'),
					},
				},
			},
			clientId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: {
					isInt: {
						msg: i18next.t('lesson_sql_validation_clientId_isInt'),
					},
					min: {
						args: [1],
						msg: i18next.t('lesson_sql_validation_clientId_min'),
					},
				},
			},
			startingAt: {
				type: DataTypes.DATE,
				allowNull: false,
				validate: {
					isAfterNow(value) {
						if (value < new Date()) {
							throw new Error(i18next.t('lesson_sql_validation_startingAt_isAfterNow'))
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
							throw new Error(i18next.t('lesson_sql_validation_endingAt_isAfterStartingAt'))
						}
					},
				},
			},
			status: {
				type: DataTypes.ENUM,
				allowNull: false,
				values: ['CONFIRMED', 'DONE', 'CANCELLED', 'ABSENCE'],
			},
		},
		{
			sequelize,
			modelName: Lesson.getModelName(),
			tableName: Lesson.getTable(),
		}
	)
}
