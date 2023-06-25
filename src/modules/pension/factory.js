import { faker } from '@faker-js/faker'
import { BaseFactory } from '@/core/BaseFactory'

export class PensionFactory extends BaseFactory {
	static uniqueConstraints = {
		name: [],
	}

	static create() {
		let name = ''
		do {
			name = faker.commerce.product()
		} while (this.uniqueConstraints.name.includes(name))
		this.uniqueConstraints.name.push(name)

		return {
			name: name,
			monthlyPrice: faker.commerce.price({ min: 50, max: 300, dec: 2 }),
			description: 'some random text',
			...this._create(),
		}
	}
}
