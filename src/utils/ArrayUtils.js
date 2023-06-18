export class ArrayUtils {
	static getRandomElement(elements) {
		this._validateArray(elements)
		return elements[Math.floor(Math.random() * elements.length)]
	}

	static _validateArray(value) {
		if (!Array.isArray(value)) {
			throw new Error('should be an array ....')
		}
	}
}
