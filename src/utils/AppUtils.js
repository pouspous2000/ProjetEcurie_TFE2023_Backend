import { Dotenv } from '@/utils/Dotenv'

export class AppUtils {
	static getAbsoluteUrl(url) {
		new Dotenv()
		// this method is used to compute an absolute url WITHOUT access to request
		return `${process.env.SERVER_SUBDOMAIN}:${process.env.SERVER_PORT}/${url}`
	}
}
