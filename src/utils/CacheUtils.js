import redisClient from '@/cache'
import { otherLogger } from '@/loggers/loggers'
import { errorHandlerLogger } from '@/loggers/loggers'

export class CacheUtils {
	static async get(cacheKey) {
		try {
			const cacheResponse = await redisClient.get(cacheKey)
			if (cacheResponse) {
				otherLogger.log('debug', `Cache hit for location ${cacheResponse}.`)
				return JSON.parse(cacheResponse)
			}
			return undefined
		} catch (error) {
			errorHandlerLogger.log('error', `Error fetching cache ${cacheKey} : ${error}`)
			return undefined
		}
	}

	static async set(cacheKey, value) {
		try {
			await redisClient.set(cacheKey, JSON.stringify(value))
			otherLogger.log('debug', `Cache set for key ${cacheKey} with value ${value}`)
		} catch (error) {
			errorHandlerLogger.log('error', `Error setting cache ${cacheKey} with value ${value} : error ${error}`)
		}
	}

	static async del(cacheKey) {
		try {
			await redisClient.del(cacheKey)
			otherLogger.log('debug', `Cache del for key ${cacheKey}`)
		} catch (error) {
			console.error(`Error deleting cache ${cacheKey}`)
			errorHandlerLogger.log('error', `Error deleting cache ${cacheKey}`)
		}
	}

	static async getAllKeysStartingWith(prefix) {
		try {
			const reply = await redisClient.scan('0', 'MATCH', `${prefix}*`)
			otherLogger.log('debug', `reply for prefix ${prefix} : ${reply}`)
			return Array.isArray(reply.keys) ? [...reply.keys] : []
		} catch (error) {
			console.error(`Error fetching all keys with prefix ${prefix}`)
			errorHandlerLogger.log('error', `Error fetching all keys with prefix ${prefix}`)
		}
	}
}
