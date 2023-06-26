import { faker } from '@faker-js/faker'
import { BaseFactory } from '@/core/BaseFactory'

export class HorseContributorFactory extends BaseFactory {
	static uniqueConstraints = {
		email: [],
	}

	static create() {
		let email = ''
		do {
			email = faker.internet.email()
		} while (this.uniqueConstraints.email.includes(email))
		return {
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			email: email,
			...this._create(),
		}
	}
}
