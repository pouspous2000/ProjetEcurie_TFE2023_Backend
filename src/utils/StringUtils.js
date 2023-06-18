export class StringUtils {
	static removeAllWhiteSpaces(value) {
		this._validateString(value)
		return value.replace(/\s+/g, '')
	}

	static capitalizeFirstLetter(value) {
		this._validateString(value)
		return value.charAt(0).toUpperCase() + value.slice(1)
	}

	static _validateString(value) {
		if (!(value instanceof String) && typeof value !== 'string') {
			throw new Error('expected string')
		}
	}
}
