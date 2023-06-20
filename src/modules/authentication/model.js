import path from 'path'
import { readFile } from 'fs/promises'
import handlebars from 'handlebars'
import { hash } from 'bcrypt'
import { Model, DataTypes } from 'sequelize'
import { StringUtils } from '@/utils/StringUtils'
import { EmailUtils } from '@/utils/EmailUtils'
import { PathUtils } from '@/utils/PathUtils'
import { AppUtils } from '@/utils/AppUtils'
import { TokenUtils } from '@/utils/TokenUtils'

export class User extends Model {
	static getTable() {
		return 'users'
	}

	static getModelName() {
		return 'User'
	}

	async sendMail(subject, html) {
		await EmailUtils.sendEmail(this.email, subject, html)
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
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: User.getModelName(),
			tableName: User.getTable(),
		}
	)

	User.addHook('beforeSave', async user => {
		if (user.changed('password')) {
			user.password = await hash(user.password, 10)
			if (!user.confirmationCode) {
				user.confirmationCode = TokenUtils.generateToken({ email: user.email })
			}
		}
	})

	User.addHook('afterCreate', async user => {
		const templateSource = await readFile(
			path.join(PathUtils.getSrcPath(), 'modules', 'authentication', 'emails', 'register.hbs'),
			'utf8'
		)
		const template = handlebars.compile(templateSource)
		const html = template({
			authenticationConfirmLink: AppUtils.getAbsoluteUrl(`authentication/confirm/${user.confirmationCode}`),
			rgpdLink: AppUtils.getAbsoluteUrl('rgpd'),
		})
		user.sendMail('email verification', html)
	})

	return User
}
