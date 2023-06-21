import { Router } from 'express'
import validate from '@/middlewares/validate'
import isAuthenticated from '@/middlewares/is-authenticated'
import { AuthenticationController } from '@/modules/authentication/controller'
import { AuthenticationValidator } from '@/modules/authentication/validation'

const prefix = '/authentication'
const AuthenticationRouter = Router()

AuthenticationRouter.post(
	`${prefix}/register`,
	validate(AuthenticationValidator.register()),
	AuthenticationController.register
)
AuthenticationRouter.get(`${prefix}/confirm/:confirmationCode`, AuthenticationController.confirm)
AuthenticationRouter.post(`${prefix}/login`, validate(AuthenticationValidator.login()), AuthenticationController.login)
AuthenticationRouter.delete(`${prefix}/me`, isAuthenticated, AuthenticationController.delete)

export default AuthenticationRouter
