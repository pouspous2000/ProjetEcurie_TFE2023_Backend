import path from 'path'
import { readFile } from 'fs/promises'
import handlebars from 'handlebars'
import { compare, hash } from 'bcrypt'
import i18next from '../../../i18n'
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

	async validatePassword(passwordPlain) {
		return await compare(passwordPlain, this.password)
	}

	async sendMail(subject, html) {
		await EmailUtils.sendEmail(this.email, subject, html)
	}

	generateToken(expiresIn = '1h') {
		return TokenUtils.generateToken(
			{
				id: this.id,
				email: this.email,
			},
			{ expiresIn: expiresIn }
		)
	}

	static associate(models) {
		User.hasOne(models.Contact, { foreignKey: 'userId', as: 'contact' })
		User.hasMany(models.Horse, { foreignKey: 'ownerId', as: 'horses' })
		User.belongsToMany(models.Horse, {
			through: models.HorseUser,
			foreignKey: 'userId',
			otherKey: 'horseId',
			as: 'rideHorses',
		})
		User.hasMany(models.Task, { foreignKey: 'creatorId', as: 'taskOwn' })
		User.hasMany(models.Task, { foreignKey: 'employeeId', as: 'taskOther' })
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
			roleId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: {
					msg: i18next.t('authentication_sql_validation_email_unique'),
				},
				validate: {
					isEmail: {
						msg: i18next.t('authentication_sql_validation_email_isEmail'),
					},
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
				unique: {
					msg: i18next.t('authentication_sql_validation_confirmationCode_unique'),
				},
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
		if (user.changed('email') && user._previousDataValues.email && user.confirmationCode) {
			user.confirmationCode = TokenUtils.generateToken({ email: user.email })
			user.status = 'PENDING'
		}
		if (user.changed('password')) {
			user.password = await hash(user.password, 10)
		}
		if (!user.confirmationCode) {
			user.confirmationCode = TokenUtils.generateToken({ email: user.email })
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

	User.addHook('afterUpdate', async user => {
		if (user.changed('status')) {
			const templateSource = await readFile(
				path.join(PathUtils.getSrcPath(), 'modules', 'authentication', 'emails', 'update.hbs'),
				'utf8'
			)
			const template = handlebars.compile(templateSource)
			const html = template({
				authenticationConfirmLink: AppUtils.getAbsoluteUrl(`authentication/confirm/${user.confirmationCode}`),
				rgpdLink: AppUtils.getAbsoluteUrl('rgpd'),
			})
			user.sendMail('email update', html)
		}
	})

	User.addHook('afterDestroy', async user => {
		const templateSource = await readFile(
			path.join(PathUtils.getSrcPath(), 'modules', 'authentication', 'emails', 'delete.hbs'),
			'utf8'
		)
		const template = handlebars.compile(templateSource)
		const html = template({})
		user.sendMail('account deletion', html)
	})

	return User
}
