export class StringUtils {
	static removeAllWhiteSpaces(value) {
		if (!(value instanceof String) && typeof value !== 'string') {
			throw new Error('expected string')
		}
		return value.replace(/\s+/g, '')
	}
}
