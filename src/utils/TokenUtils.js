import { sign, verify } from 'jsonwebtoken'
import { Dotenv } from '@/utils/Dotenv'

export class TokenUtils {
	static generateToken(data, options = {}) {
		new Dotenv()
		return sign(data, process.env.JWT_KEY, options)
	}

	static verifyToken(token) {
		new Dotenv()
		return verify(token, process.env.JWT_KEY)
	}
}
