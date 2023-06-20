import { faker } from '@faker-js/faker'
import { hash } from 'bcrypt'
import { BaseFactory } from '@/core/BaseFactory'

export class UserFactory extends BaseFactory {
	static uniqueConstraints = {
		email: [],
		confirmationCode: [],
	}

	static async create(isConfirmed = false) {
		let email
		do {
			email = faker.internet.email()
		} while (this.uniqueConstraints.email.includes(email))

		this.uniqueConstraints.email.push(email)
		const confirmationCode = await hash(`${email}_${'password'}`, 10)
		this.uniqueConstraints.confirmationCode.push(confirmationCode)

		return {
			email: email,
			password: await hash('password', 10),
			status: isConfirmed ? 'ACTIVE' : 'PENDING',
			confirmationCode: confirmationCode,
			...this._create(),
		}
	}

	static async bulkCreate(nbRecords, isConfirmed = false) {
		const records = []
		for (let i = 0; i < nbRecords; i++) {
			records.push(await this.create(isConfirmed))
		}
		return records
	}

	static async createCecile() {
		this.uniqueConstraints.email.push('cecile.bonnet@gail.com')
		const confirmationCode = await hash('cecile.bonnet@gail.com_password', 10)
		this.uniqueConstraints.confirmationCode.push(confirmationCode)

		return {
			email: 'cecile.bonnet@gail.com',
			password: await hash('password', 10),
			status: 'ACTIVE',
			confirmationCode: confirmationCode,
			...this._create(),
		}
	}
}
