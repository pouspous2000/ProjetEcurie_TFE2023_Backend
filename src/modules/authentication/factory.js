import { faker } from '@faker-js/faker'
import { BaseFactory } from '@/core/BaseFactory'

export class UserFactory extends BaseFactory {
	static uniqueConstraints = {
		email: [],
		confirmationCode: [],
	}

	static create(isConfirmed = false) {
		let email
		do {
			email = faker.internet.email()
		} while (this.uniqueConstraints.email.includes(email))

		this.uniqueConstraints.email.push(email)

		let confirmationCode = 'confirmation'
		let i = 1
		while (this.uniqueConstraints.confirmationCode.includes(confirmationCode)) {
			confirmationCode = `confirmation_${i}`
			i++
		}
		this.uniqueConstraints.confirmationCode.push(confirmationCode)

		return {
			email: email,
			password: 'password',
			status: isConfirmed ? 'ACTIVE' : 'PENDING',
			confirmationCode: confirmationCode,
			...this._create(),
		}
	}

	static bulkCreate(nbRecords, isConfirmed = false) {
		const records = []
		for (let i = 0; i < nbRecords; i++) {
			records.push(this.create(isConfirmed))
		}
		return records
	}

	static createCecile() {
		this.uniqueConstraints.email.push('cecile.bonnet@gail.com')

		let confirmationCode = 'confirmation'
		let i = 1
		while (this.uniqueConstraints.confirmationCode.includes(confirmationCode)) {
			confirmationCode = `confirmation_${i}`
			i++
		}
		this.uniqueConstraints.confirmationCode.push(confirmationCode)

		return {
			email: 'cecile.bonnet@gail.com',
			password: 'password',
			status: 'ACTIVE',
			confirmationCode: confirmationCode,
			...this._create(),
		}
	}
}
