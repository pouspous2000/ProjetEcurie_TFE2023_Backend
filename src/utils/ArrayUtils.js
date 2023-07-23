import i18next from '../../i18n'

export class ArrayUtils {
	static getRandomElement(elements) {
		this._validateArray(elements)
		return elements[Math.floor(Math.random() * elements.length)]
	}

	static validateFkArray(values, notArrayMessage, notIntegerMessage, notPositiveMessage) {
		if (typeof values === 'string') {
			values = values.split(',')
		}
		if (!Array.isArray(values)) {
			throw new Error(i18next.t(notArrayMessage))
		}
		values.forEach(value => {
			try {
				Number.parseInt(value)
			} catch (error) {
				throw new Error(i18next.t(notIntegerMessage))
			}
		})
		values.forEach(value => {
			if (Number.parseInt(value) <= 0) {
				throw new Error(i18next.t(notPositiveMessage))
			}
		})
		return true
	}

	static _validateArray(value) {
		if (!Array.isArray(value)) {
			throw new Error('should be an array ....')
		}
	}
}
