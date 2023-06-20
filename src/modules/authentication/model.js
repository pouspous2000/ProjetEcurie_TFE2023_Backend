import { hash } from 'bcrypt'
import { Model, DataTypes } from 'sequelize'
import { StringUtils } from '@/utils/StringUtils'

export class User extends Model {
	static getTable() {
		return 'users'
	}

	static getModelName() {
		return 'User'
	}
}

export default function (sequelize) {
	User.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					isEmail: true,
				},
				set(value) {
					this.setDataValue('email', StringUtils.removeAllWhiteSpaces(value.toLowerCase()))
				},
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			status: {
				type: DataTypes.ENUM,
				values: ['ACTIVE', 'PENDING'],
				allowNull: true,
				defaultValue: 'PENDING',
			},
			confirmationCode: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: User.getModelName(),
			tableName: User.getTable(),
		}
	)

	// define hooks here
	User.addHook('beforeSave', async user => {
		if (user.changed('password')) {
			user.password = await hash(user.password, 10)
		}
	})

	return User
}
