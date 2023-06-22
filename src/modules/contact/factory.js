import { faker } from '@faker-js/faker'
import { BaseFactory } from '@/core/BaseFactory'

export class ContactFactory extends BaseFactory {
	static uniqueConstraints = {
		mobile: [],
	}

	static create(userId) {
		// unique constraint management
		let mobile = ''
		do {
			mobile = faker.phone.number()
		} while (this.uniqueConstraints.mobile.includes(mobile))
		this.uniqueConstraints.mobile.push(mobile)

		const address = this._getRandomAddress()

		return {
			userId: userId,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			phone: faker.phone.imei(),
			mobile: faker.phone.number(),
			address: address,
			invoicingAddress: Math.random() < 0.5 ? address : this._getRandomAddress(),
			...this._create(),
		}
	}

	static _getRandomAddress() {
		return `${faker.location.streetAddress({ useFullAddress: true })} ${faker.location.country()}`
	}
}
