import { Router } from 'express'
import validate from '@/middlewares/validate'
import isAuthenticated from '@/middlewares/is-authenticated'
import { AuthenticationController } from '@/modules/authentication/controller'
import { AuthenticationValidator } from '@/modules/authentication/validation'

const prefix = 'authentication'
const AuthenticationRouter = Router()
const controller = new AuthenticationController()

AuthenticationRouter.post(`/${prefix}/register`, validate(AuthenticationValidator.register()), controller.register)

AuthenticationRouter.get(`/${prefix}/confirm/:confirmationCode`, controller.confirm)
AuthenticationRouter.post(`/${prefix}/login`, validate(AuthenticationValidator.login()), controller.login)
AuthenticationRouter.delete(`/${prefix}/me`, isAuthenticated, controller.delete)
AuthenticationRouter.put(
	`/${prefix}/me`,
	isAuthenticated,
	validate(AuthenticationValidator.update()),
	controller.update
)

export default AuthenticationRouter
