import { faker } from '@faker-js/faker'
import { BaseFactory } from '@/core/BaseFactory'

export class HorseContributorJobFactory extends BaseFactory {
	static uniqueConstraints = {
		name: [],
	}

	static create() {
		let name = ''
		do {
			name = faker.person.jobTitle()
			if (this.uniqueConstraints.name.includes(name)) {
				name = `${name}${Math.random()}`
			}
		} while (this.uniqueConstraints.name.includes(name))

		return {
			name: name,
			...this._create(),
		}
	}

	static createVeterinary() {
		return {
			name: 'Veterinarian',
			...this._create(),
		}
	}
}
