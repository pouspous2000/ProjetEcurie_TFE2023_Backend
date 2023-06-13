import rateLimit from 'express-rate-limit'
import i18next from '../../i18n'

export const generalExceptLoginRateLimiter = rateLimit({
	windowMs: 60 * 1000, // 60 seconds in ms
	max: 60,
	message: i18next.t('middlewares_tooManyRequest'),
	standardHeaders: true,
	legacyHeaders: false,
})
