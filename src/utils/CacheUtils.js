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
			errorHandlerLogger.log('error', `Error deleting cache ${cacheKey}`)
		}
	}

	static async getAllKeysStartingWith(prefix) {
		try {
			const reply = await redisClient.scan('0', 'MATCH', `${prefix}*`)
			otherLogger.log('debug', `reply for prefix ${prefix} : ${reply}`)
			return Array.isArray(reply.keys) ? [...reply.keys] : []
		} catch (error) {
			errorHandlerLogger.log('error', `Error fetching all keys with prefix ${prefix}`)
		}
	}
}

export class ModelCacheHooksUtils {
	static _getCacheKey(record, modelName) {
		return `${modelName}_${record.id}`
	}

	static async afterFind(records, modelName) {
		if (records === null) {
			return
		}
		if (!Array.isArray(records)) {
			records = [records] // [WARN] this is not a pure function
		}
		for (const record of records) {
			// [IMP] Promise.all for extra perf
			const cacheKey = this._getCacheKey(record, modelName)
			const cacheValue = await CacheUtils.get(cacheKey)
			if (!cacheValue) {
				await CacheUtils.set(cacheKey, record)
			}
		}
	}

	static async afterDestroy(record, modelName) {
		const cacheKey = this._getCacheKey(record, modelName)
		await CacheUtils.del(cacheKey)
	}

	static async afterCreate(record, modelName) {
		const cacheKey = this._getCacheKey(record, modelName)
		await CacheUtils.set(cacheKey, record)
	}

	static async afterUpdate(record, modelName) {
		const cacheKey = this._getCacheKey(record, modelName)
		await CacheUtils.set(cacheKey, record)
	}
}
