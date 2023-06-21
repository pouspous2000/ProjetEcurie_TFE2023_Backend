import { SequelizeErrorFormatter } from '@/core/SequelizeErrorFormatter'

export const sequelizeErrorFormatter = (error, request, response, next) => {
	try {
		new SequelizeErrorFormatter(error)
	} catch (error) {
		return response.status(422).json(error)
	}
	next(error)
}
