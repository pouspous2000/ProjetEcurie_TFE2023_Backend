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

	Role.addHook('afterDestroy', async record => {
		await ModelCacheHooksUtils.afterDestroy(record, Role.getModelName())
	})

	Role.addHook('afterCreate', async record => {
		await ModelCacheHooksUtils.afterCreate(record, Role.getModelName())
	})

	Role.addHook('afterUpdate', async record => {
		await ModelCacheHooksUtils.afterUpdate(record, Role.getModelName())
	})

	return Role
}
