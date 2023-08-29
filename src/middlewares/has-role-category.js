import createError from 'http-errors'
import i18next from '../../i18n'
import { RoleService } from '@/modules/role/service'

export default function (roleCategories) {
	return async (request, response, next) => {
		if (!request.user) {
			return next(createError(401, 'authentication_notAuthenticated'))
		}

		if (!request.user.roleCategory) {
			request.user.roleCategory = await new RoleService().getRoleCategory(request.user.roleId)
		}

		if (!roleCategories.includes(request.user.roleCategory)) {
			return next(createError(401, i18next.t('authentication_role_incorrectRolePermission')))
		}

		return next()
	}
}
