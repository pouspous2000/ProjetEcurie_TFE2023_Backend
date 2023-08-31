import { Router } from 'express'
import isAuthenticated from '@/middlewares/is-authenticated'
import hasRoleCategory from '@/middlewares/has-role-category'
import validate from '@/middlewares/validate'
import { AuthenticationController } from '@/modules/authentication/controller'
import { AuthenticationValidator } from '@/modules/authentication/validation'

const prefix = 'authentication'
const AuthenticationRouter = Router()
const controller = new AuthenticationController()

AuthenticationRouter.post(
	`/${prefix}/register-manually`,
	isAuthenticated,
	hasRoleCategory(['ADMIN']),
	validate(AuthenticationValidator.registerManually()),
	controller.registerManually
)
AuthenticationRouter.post(
	`/${prefix}/register`,
	validate(AuthenticationValidator.registerClient()),
	controller.registerClient
)
AuthenticationRouter.post(
	`/${prefix}/confirm`,
	validate(AuthenticationValidator.validateConfirmationCode()),
	controller.confirm
)
AuthenticationRouter.post(`/${prefix}/login`, validate(AuthenticationValidator.login()), controller.login)
AuthenticationRouter.delete(`/${prefix}/me`, isAuthenticated, controller.delete)
AuthenticationRouter.put(
	`/${prefix}/me`,
	isAuthenticated,
	validate(AuthenticationValidator.update()),
	controller.update
)

export default AuthenticationRouter
