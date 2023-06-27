import { faker } from '@faker-js/faker'
import { BaseFactory } from '@/core/BaseFactory'

export class AdditiveFactory extends BaseFactory {
	static uniqueConstraints = {
		name: [],
	}

	static create() {
		let name = ''
		do {
			name = faker.commerce.product()
			if (this.uniqueConstraints.name.includes(name)) {
				name = `${name}${Math.random().toString()}`
			}
		} while (this.uniqueConstraints.name.includes(name))
		this.uniqueConstraints.name.push(name)

		return {
			name: name,
			price: faker.commerce.price({ min: -100, max: 300, dec: 2 }),
			...this._create(),
		}
	}
}
