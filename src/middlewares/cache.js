import { CacheUtils } from '@/utils/CacheUtils'

export default function (modelName) {
	return async (request, response, next) => {
		let cacheKey = modelName

		if (request.params.id) {
			cacheKey += `_${request.params.id}`
			try {
				const cachedValue = await CacheUtils.get(cacheKey)
				if (cachedValue) {
					return response.status(200).json(cachedValue)
				}
				next()
			} catch (error) {
				next()
			}
		} else {
			try {
				const keys = await CacheUtils.getAllKeysStartingWith(cacheKey)
				const cachedValues = []
				for (const key of keys) {
					cachedValues.push(await CacheUtils.get(key))
				}
				if (cachedValues) {
					return response.status(200).json(cachedValues)
				}
				next()
			} catch (error) {
				console.log(`error while fetching with scan : ${error}`)
				next()
			}
		}
	}
}
