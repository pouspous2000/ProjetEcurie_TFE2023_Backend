import { Model, DataTypes } from 'sequelize'
import i18next from '../../../i18n'
import { StringUtils } from '@/utils/StringUtils'

export class Task extends Model {
	static getTable() {
		return 'tasks'
	}

	static getModelName() {
		return 'Task'
	}

	static associate(models) {
		Task.belongsTo(models.User, { foreignKey: 'creatorId', as: 'creator' })
		Task.belongsTo(models.User, { foreignKey: 'employeeId', as: 'employee' })
	}
}

export default function (sequelize) {
	Task.init(
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
						msg: i18next.t('task_sql_validation_creatorId_isInt'),
					},
					min: {
						args: [1],
						msg: i18next.t('task_sql_validation_creatorId_min'),
					},
				},
			},
			employeeId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: {
					isInt: {
						msg: i18next.t('task_sql_validation_employeeId_isInt'),
					},
					min: {
						args: [1],
						msg: i18next.t('task_sql_validation_employeeId_min'),
					},
				},
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: i18next.t('task_sql_validation_name_notEmpty'),
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
						msg: i18next.t('task_sql_validation_description_notEmpty'),
					},
				},
				set(value) {
					this.setDataValue('description', value.trim())
				},
			},
			startingAt: {
				type: DataTypes.DATE,
				allowNull: false,
				validate: {
					isAfterNow(value) {
						if (value < new Date()) {
							throw new Error(i18next.t('task_sql_validation_startingAt_isAfterNow'))
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
							throw new Error(i18next.t('task_sql_validation_endingAt_isAfterStartingAt'))
						}
					},
				},
			},
			remark: {
				type: DataTypes.TEXT,
				allowNull: true,
				set(value) {
					this.setDataValue('remark', (value = value === null ? null : value.trim()))
				},
			},
			status: {
				type: DataTypes.ENUM,
				allowNull: false,
				values: ['PENDING', 'CONFIRMED', 'IN PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED'],
			},
		},
		{
			sequelize,
			modelName: Task.getModelName(),
			tableName: Task.getTable(),
		}
	)

	return Task
}
