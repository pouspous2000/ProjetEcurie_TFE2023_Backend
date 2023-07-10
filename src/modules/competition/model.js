import { Model, DataTypes } from 'sequelize'
import { StringUtils } from '@/utils/StringUtils'
import i18next from '../../../i18n'

export class Competition extends Model {
	static getTable() {
		return 'competitions'
	}

	static getModelName() {
		return 'Competition'
	}

	static associate(models) {
		Competition.belongsTo(models.User, { foreignKey: 'creatorId', as: 'creator' })
		Competition.belongsToMany(models.User, {
			through: models.CompetitionUser,
			foreignKey: 'competitionId',
			otherKey: 'userId',
			as: 'participants',
		})
	}
}

export default function (sequelize) {
	Competition.init(
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
						msg: i18next.t('competition_sql_validation_creatorId_isInt'),
					},
					min: {
						args: [1],
						msg: i18next.t('competition_sql_validation_creatorId_min'),
					},
				},
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: i18next.t('competition_sql_validation_name_notEmpty'),
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
						msg: i18next.t('competition_sql_validation_description_notEmpty'),
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
							throw new Error(i18next.t('competition_sql_validation_startingAt_isAfterNow'))
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
							throw new Error(i18next.t('competition_sql_validation_endingAt_isAfterStartingAt'))
						}
					},
				},
			},
		},
		{
			sequelize,
			modelName: Competition.getModelName(),
			tableName: Competition.getTable(),
		}
	)

	return Competition
}
