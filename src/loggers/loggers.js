import path from 'path'
import { format, transports, createLogger } from 'winston'
import { PathUtils } from '@/utils/PathUtils'

export const requestLogger = createLogger({
	transports: [
		new transports.File({
			level: 'info',
			filename: path.join(PathUtils.getRootPath(), 'logs', 'requests', 'info.log'),
		}),
		new transports.File({
			level: 'warn',
			filename: path.join(PathUtils.getRootPath(), 'logs', 'requests', 'warn.log'),
		}),
		new transports.File({
			level: 'error',
			filename: path.join(PathUtils.getRootPath(), 'logs', 'requests', 'error.log'),
		}),
	],
	format: format.combine(format.json(), format.colorize(), format.timestamp(), format.prettyPrint()),
	statusLevels: true,
})

export const otherLogger = createLogger({
	transports: [
		new transports.File({
			level: 'debug',
			filename: path.join(PathUtils.getRootPath(), 'logs', 'others', 'debug.log'),
		}),
		new transports.File({
			level: 'info',
			filename: path.join(PathUtils.getRootPath(), 'logs', 'others', 'info.log'),
		}),
		new transports.File({
			level: 'warn',
			filename: path.join(PathUtils.getRootPath(), 'logs', 'others', 'warn.log'),
		}),
	],
	format: format.combine(format.json(), format.colorize(), format.timestamp(), format.prettyPrint()),
})

export const errorHandlerLogger = createLogger({
	transports: [
		new transports.File({
			filename: path.join(PathUtils.getRootPath(), 'logs', 'others', 'error.log'),
		}),
	],
	format: format.combine(format.json(), format.colorize(), format.timestamp(), format.prettyPrint()),
})
