import { Model, DataTypes } from 'sequelize'
import { ModelCacheHooksUtils } from '@/utils/CacheUtils'
import { StringUtils } from '@/utils/StringUtils'

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
				unique: true,
				validate: {
					notEmpty: true,
				},
				set(value) {
					this.setDataValue('name', StringUtils.capitalizeFirstLetter(value.toLowerCase()))
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
