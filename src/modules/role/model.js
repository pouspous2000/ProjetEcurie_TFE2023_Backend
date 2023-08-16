import { Model, DataTypes } from 'sequelize'
import { ModelCacheHooksUtils } from '@/utils/CacheUtils'
import { StringUtils } from '@/utils/StringUtils'
import i18next from '../../../i18n'

export class Role extends Model {
	static getTable() {
		return 'roles'
	}

	static getModelName() {
		return 'Role'
	}

	static associate(models) {
		Role.belongsTo(models.Role, { foreignKey: 'parentId', as: 'parent' })
		Role.hasMany(models.Role, { foreignKey: 'parentId', as: 'children' })
		Role.hasMany(models.User, { foreignKey: 'roleId', as: 'users' })
	}
}

export default function (sequelize) {
	Role.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			parentId: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: {
					msg: i18next.t('role_sql_validation_name_unique'),
				},
				validate: {
					notEmpty: {
						msg: i18next.t('role_sql_validation_name_notEmpty'),
					},
				},
				set(value) {
					this.setDataValue(
						'name',
						['ADMIN', 'EMPLOYEE', 'CLIENT'].includes(value)
							? value
							: StringUtils.capitalizeFirstLetter(value.toLowerCase())
					)
				},
			},
			isEditable: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
				defaultValue: true,
			},
		},
		{
			sequelize,
			modelName: Role.getModelName(),
			tableName: Role.getTable(),
		}
	)

	// use Hooks  here
	Role.addHook('afterFind', async records => {
		await ModelCacheHooksUtils.afterFind(records, Role.getModelName())
	})

	Role.addHook('afterDestroy', async () => {
		await ModelCacheHooksUtils.clearModelCache(Role.getModelName()) //[IMP] we could keep the cache and update it instead of clear
	})

	Role.addHook('afterCreate', async () => {
		await ModelCacheHooksUtils.clearModelCache(Role.getModelName()) //[IMP] we could keep the cache and update it instead of clear
	})

	Role.addHook('afterUpdate', async () => {
		await ModelCacheHooksUtils.clearModelCache(Role.getModelName()) //[IMP] we could keep the cache and update it instead of clear
	})

	return Role
}
