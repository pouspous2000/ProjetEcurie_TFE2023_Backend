import { CacheUtils } from '@/utils/CacheUtils'

export default function (modelName) {
	return async (request, response, next) => {
		let cacheKey = modelName

		if (request.params.id) {
			cacheKey += `_${request.params.id}`
			try {
				const cacheValue = await CacheUtils.get(cacheKey)
				if (cacheValue) {
					return response.status(200).json(cacheValue)
				}
				next()
			} catch (error) {
				next()
			}
		} else {
			try {
				let keys = await CacheUtils.getAllKeysStartingWith(cacheKey)
				if (!Array.isArray(keys)) {
					keys = []
				}
				const cacheValues = []
				for (const key of keys) {
					cacheValues.push(await CacheUtils.get(key)) // [IMP] we could use a single call with all keys
				}
				if (cacheValues.length) {
					return response.status(200).json(cacheValues)
				}
				next()
			} catch (error) {
				console.log(`error while fetching with scan : ${error}`)
				next()
			}
		}
	}
}
