import { Op } from 'sequelize'
import createError from 'http-errors'
import db from '@/database'
import i18next from '../../../i18n'
import { RoleService } from '@/modules/role/service'

export class AuthenticationService {
	constructor() {}

	async register(data) {
		return await db.models.User.create(data)
	}

	async registerClient(data) {
		const clientRole = await db.models.Role.findOne({
			where: {
				name: {
					[Op.eq]: 'CLIENT',
				},
			},
		})
		const user = await db.models.User.findOne({
			where: {
				email: data.email,
			},
		})
		if (user) {
			throw createError(422, i18next.t('authentication_already_registered'))
		}
		data.roleId = clientRole.id
		return await this.register(data)
	}

	async registerManually(data) {
		const role = await db.models.Role.findByPk(data.roleId)
		if (!role) {
			throw createError(404, i18next.t('role_404'))
		}
		const user = await db.models.User.findOne({
			where: {
				email: data.email,
			},
		})
		if (user) {
			throw createError(422, i18next.t('authentication_already_registered'))
		}
		return await this.register(data)
	}

	async confirm(confirmationCode) {
		const user = await this.findUserByConfirmPasswordOrFail(confirmationCode)
		if (user.status === 'ACTIVE') {
			throw createError(422, i18next.t('authentication_already_confirmed'))
		}
		user.status = 'ACTIVE'
		return await user.save()
	}

	async login(data) {
		const user = await this.findUserByEmailOrFail(data.email)
		await this.validatePassword(user, data.password)
		if (user.status !== 'ACTIVE') {
			throw createError(401, i18next.t('authentication_login_user_unconfirmed'))
		}
		const token = user.generateToken()
		const refreshToken = user.generateToken('2h')
		const roleCategory = await new RoleService().getRoleCategory(user.roleId)
		return {
			token,
			refreshToken,
			roleCategory,
		}
	}

	async delete(user) {
		return await user.destroy()
	}

	async update(user, data) {
		return await user.set(data).save()
	}

	async findUserByConfirmPasswordOrFail(confirmationCode) {
		const user = await db.models.User.findOne({ where: { confirmationCode } })
		if (!user) {
			throw createError(404, i18next.t('authentication_401_confirmationCode'))
		}
		return user
	}

	async findUserByEmailOrFail(email) {
		const user = await db.models.User.findOne({ where: { email } })
		if (!user) {
			throw createError(401, i18next.t('authentication_404'))
		}
		return user
	}

	async validatePassword(user, password) {
		const isPasswordValid = await user.validatePassword(password)
		if (!isPasswordValid) {
			throw createError(401, i18next.t('authentication_login_password_invalid'))
		}
		return isPasswordValid
	}
}
